import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { aiAvailable, chat, chatJson, hasMistral, MistralRateLimitError, MODELS } from "@/lib/mistral";
import { localExtractSkills } from "@/lib/naya-local";
import { computeCompatibility } from "@/lib/compat";
import { localCandidature, localRendezvous, localServices } from "@/lib/local-writer";
import type { CoherenceCheck, Compatibility, Lang, MeetingSituation, Opportunity, PortfolioItem, Profile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `Tu es l'assistante IA de NAYA, une plateforme qui aide les jeunes femmes de 18 à 30 ans (principalement au Togo et en Afrique de l'Ouest francophone) à identifier, valoriser et commercialiser leurs compétences.
Principes :
- Tu valorises aussi les compétences informelles (aide familiale, petit commerce, tontine, associations, église, garde d'enfants, réseaux sociaux…).
- Ton chaleureux, concret, jamais condescendant. Vouvoiement.
- Tu ne promets jamais d'emploi ni de revenu garanti.
- Contexte local : FCFA, Lomé, WhatsApp et Facebook très utilisés.
- RÈGLE ABSOLUE : tu n'inventes jamais une compétence, une expérience, un diplôme, un chiffre, un client ou une réalisation. Tu n'utilises que les faits fournis. S'il manque une information, tu écris sans elle.`;

const TONES: Record<string, string> = {
  professionnel: "professionnel et soigné",
  naturel: "naturel et chaleureux, comme on parle à quelqu'un qu'on respecte",
  direct: "direct et concis, phrases courtes, va droit au but",
  convaincant: "convaincant : met en avant la valeur apportée, sans exagérer",
};

type Ctx = { sb: SupabaseClient; uid: string; profile: Profile; items: PortfolioItem[] };

/** Charge les données réelles de l'utilisatrice avec SON jeton (les règles RLS s'appliquent). */
async function context(token: string): Promise<Ctx | null> {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth.user) return null;
  const [{ data: profile }, { data: items }] = await Promise.all([
    sb.from("profiles").select("*").eq("id", auth.user.id).single(),
    sb.from("portfolio_items").select("*").eq("user_id", auth.user.id).order("created_at", { ascending: false }),
  ]);
  if (!profile) return null;
  return { sb, uid: auth.user.id, profile: profile as Profile, items: (items as PortfolioItem[]) ?? [] };
}

function profileFacts(p: Profile, items: PortfolioItem[]) {
  return {
    nom: p.full_name,
    titre: p.headline || undefined,
    ville: p.city || undefined,
    presentation: p.bio || undefined,
    experiences: p.experiences || undefined,
    formation: p.education || undefined,
    certifications: p.certifications || undefined,
    disponibilites: p.availability || undefined,
    competences: p.skills.map((s) => `${s.name}${s.level ? ` (${s.level})` : ""}`),
    centres_interet: p.interests.length ? p.interests : undefined,
    realisations: items.slice(0, 8).map((i) => ({ titre: i.title, description: i.description || undefined, role: i.role || undefined, resultats: i.results || undefined, outils: i.tools?.length ? i.tools : undefined })),
  };
}

/** Réponse quand l'IA est indisponible pour une tâche sans repli local. */
const noAi = () =>
  NextResponse.json(
    { error: hasMistral() ? "L'IA est très sollicitée en ce moment. Réessayez dans quelques minutes, ou remplissez les champs vous-même." : "L'IA n'est pas configurée (clé MISTRAL_API_KEY manquante)." },
    { status: 503 },
  );

const langLine = (lang: Lang) => (lang === "en" ? "Rédige le texte final en ANGLAIS." : "Rédige le texte final en français.");

/** Étape 9 : vérification de cohérence. Un second modèle relit le texte et signale toute affirmation absente des faits. */
async function verify(facts: unknown, text: string, missing: string[] = []): Promise<CoherenceCheck> {
  try {
    const r = await chatJson<{ issues: string[] }>(
      [
        { role: "system", content: "Tu es un vérificateur factuel strict. Tu réponds uniquement en JSON." },
        {
          role: "user",
          content:
            `FAITS DU PROFIL (seule source de vérité) :\n${JSON.stringify(facts)}\n\n` +
            (missing.length ? `Compétences que le profil NE possède PAS : ${missing.join(", ")}\n\n` : "") +
            `TEXTE À VÉRIFIER :\n"""${text}"""\n\n` +
            `Liste chaque affirmation du texte sur la candidate (compétence, expérience, diplôme, chiffre, réalisation) qui n'est PAS appuyée par les faits. ` +
            `Les formules de motivation, de politesse ou d'envie d'apprendre sont acceptées. ` +
            `Réponds {"issues": ["affirmation non appuyée — explication courte", ...]} ; liste vide si tout est exact. En français.`,
        },
      ],
      { model: MODELS.fast, temperature: 0, maxTokens: 600 },
    );
    const issues = Array.isArray(r.issues) ? r.issues.filter((x) => typeof x === "string" && x.trim()).slice(0, 6) : [];
    return { ok: issues.length === 0, issues };
  } catch {
    return { ok: true, issues: [] };
  }
}

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return NextResponse.json({ error: "Non connectée" }, { status: 401 });
  const ctx = await context(token);
  if (!ctx) return NextResponse.json({ error: "Session invalide" }, { status: 401 });

  const body = await req.json();
  const kind = String(body.kind ?? "");
  const ai = aiAvailable();
  const { profile, items } = ctx;

  try {
    /* ---------- Découverte des compétences ---------- */
    if (kind === "skills") {
      const text = String(body.text ?? "").slice(0, 6000);
      if (!ai) return NextResponse.json({ source: "local", ...localExtractSkills(text) });
      const out = await chatJson<{ summary: string; skills: unknown[]; suggestions: unknown[] }>([
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content:
            `Réponses d'une utilisatrice au questionnaire de découverte :\n\n${text}\n\n` +
            `1. Identifie 4 à 10 compétences concrètes (techniques et savoir-être), y compris informelles. Catégories courtes (ex. "Couture & mode", "Communication digitale", "Savoir-être"). Niveau parmi "débutante", "intermédiaire", "confirmée".\n` +
            `2. Propose 3 activités rémunératrices réalistes localement, chacune avec un premier pas faisable cette semaine.\n` +
            `3. Rédige un résumé encourageant de 2 phrases.\n` +
            `JSON : {"summary": string, "skills": [{"name","category","level"}], "suggestions": [{"title","description","firstStep"}]}`,
        },
      ]);
      return NextResponse.json({ source: "ia", summary: out.summary, skills: out.skills ?? [], suggestions: out.suggestions ?? [] });
    }

    /* ---------- Explication des classements (le score reste calculé) ---------- */
    if (kind === "match_reasons") {
      const { data } = await ctx.sb.from("opportunities").select("*").eq("status", "verifiee");
      const opps = ((data as Opportunity[]) ?? []).slice(0, 30);
      const analyses = opps.map((o) => ({ o, c: computeCompatibility(profile, o, items) }));
      if (!ai) return NextResponse.json({ source: "local", reasons: {} });
      const out = await chatJson<{ reasons: { id: string; reason: string }[] }>(
        [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content:
              `Pour chaque mission, écris une phrase (max 22 mots, "vous…") qui explique à l'utilisatrice pourquoi elle lui correspond ou ce qui lui manque, en t'appuyant UNIQUEMENT sur l'analyse fournie. Ne mentionne pas de pourcentage.\n` +
              JSON.stringify(analyses.map(({ o, c }) => ({ id: o.id, mission: o.title, acquis: c.matchedSkills.map((m) => m.skill), a_renforcer: c.missingSkills, points_forts: c.strengths, complete: c.complete }))) +
              `\nJSON : {"reasons": [{"id","reason"}]}`,
          },
        ],
        { model: MODELS.fast, temperature: 0.4 },
      );
      return NextResponse.json({ source: "ia", reasons: Object.fromEntries((out.reasons ?? []).map((r) => [r.id, r.reason])) });
    }

    /* ---------- Onglet Candidature ---------- */
    if (kind === "candidature") {
      const format = String(body.format ?? "court") as "court" | "lettre" | "spontanee";
      const tone = String(body.tone ?? "professionnel");
      const lang = (body.lang === "en" ? "en" : "fr") as Lang;
      const channel = body.channel === "whatsapp" ? "whatsapp" : "email";
      const extra = String(body.extra ?? "").slice(0, 1500);
      const answers = (Array.isArray(body.answers) ? body.answers : []).filter((a: { answer?: string }) => a?.answer?.trim()).slice(0, 6) as { question: string; answer: string }[];
      const previous = String(body.previous ?? "").slice(0, 4000);
      const spont = { organization: String(body.organization ?? "").slice(0, 120), domain: String(body.domain ?? "").slice(0, 120) };

      let opp: Opportunity | null = null;
      if (body.opportunityId) {
        const { data } = await ctx.sb.from("opportunities").select("*").eq("id", body.opportunityId).maybeSingle();
        opp = (data as Opportunity) ?? null;
        if (!opp) return NextResponse.json({ error: "Mission introuvable" }, { status: 404 });
      } else if (format !== "spontanee") {
        return NextResponse.json({ error: "Choisissez d'abord la mission visée." }, { status: 400 });
      }
      const analysis: Compatibility | null = opp ? computeCompatibility(profile, opp, items) : null;
      const facts = profileFacts(profile, items);
      const extraAll = [extra, ...answers.map((a) => `${a.question} → ${a.answer}`)].filter(Boolean).join("\n");

      const local = () => {
        const r = localCandidature(profile, opp, analysis, { format, channel, lang, extra: extraAll, organization: spont.organization });
        return NextResponse.json({ source: "local", ...r, advice: analysis?.tips ?? [], analysis, checks: null });
      };
      if (!ai) return local();

      try {
      const shape = {
        court: channel === "whatsapp" ? "un message WhatsApp de candidature de 90 à 140 mots, aéré, sans objet" : "un e-mail de candidature court de 130 à 200 mots",
        lettre: "une lettre de motivation détaillée de 280 à 400 mots, structurée en paragraphes (accroche, adéquation avec la mission, valeur ajoutée, motivation, disponibilités et conclusion)",
        spontanee: `une candidature spontanée de 150 à 250 mots adressée à ${spont.organization || opp?.organization || "la structure"}${spont.domain ? `, dans le domaine ${spont.domain}` : ""}`,
      }[format];

      const out = await chatJson<{ subject: string; text: string; advice: string[] }>(
        [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content:
              (opp
                ? `MISSION VISÉE :\n${JSON.stringify({ intitule: opp.title, structure: opp.organization, type_structure: opp.org_type, domaine: opp.category, description: opp.description, competences_recherchees: opp.skills, lieu: opp.remote ? "à distance" : opp.location, remuneration: opp.pay })}\n\n`
                : "") +
              `PROFIL (seuls faits utilisables) :\n${JSON.stringify(facts)}\n\n` +
              (analysis
                ? `ANALYSE DE COMPATIBILITÉ (calculée par NAYA, ne la contredis pas) :\n${JSON.stringify({ score: analysis.score, competences_acquises: analysis.matchedSkills, competences_evoquees: analysis.partialSkills, competences_absentes: analysis.missingSkills, points_forts: analysis.strengths, points_a_renforcer: analysis.gaps })}\n\n`
                : "") +
              (extraAll ? `PRÉCISIONS DONNÉES PAR L'UTILISATRICE (faits utilisables) :\n${extraAll}\n\n` : "") +
              (previous ? `VERSION PRÉCÉDENTE (propose une formulation nettement différente, même fond) :\n"""${previous}"""\n\n` : "") +
              `TÂCHE : rédige ${shape}. Ton : ${TONES[tone] ?? TONES.professionnel}. ${langLine(lang)}\n` +
              `- Réponds directement aux besoins de CETTE mission : cite ce que la mission demande et relie-le aux compétences et expériences réelles du profil.\n` +
              `- Mets d'abord en avant les compétences acquises et les expériences/réalisations liées ; explique la motivation et la valeur ajoutée.\n` +
              `- Pour une compétence absente : ne prétends JAMAIS la maîtriser ; tu peux exprimer l'envie de l'apprendre si c'est pertinent.\n` +
              `- Canal : ${channel === "whatsapp" ? "WhatsApp (pas de formule d'e-mail, phrases courtes)" : "e-mail (formule d'appel et de politesse)"}. Signe avec le nom "${profile.full_name}".\n` +
              `- Pas de markdown, pas de crochets à compléter.\n` +
              `Ajoute aussi 2 à 4 conseils personnalisés pour renforcer cette candidature (en français).\n` +
              `JSON : {"subject": "objet de l'e-mail (vide pour WhatsApp)", "text": "le message complet", "advice": ["conseil", ...]}`,
          },
        ],
        { temperature: previous ? 0.85 : 0.55, maxTokens: 2200 },
      );
      const checks = await verify({ ...facts, precisions: extraAll || undefined }, out.text, analysis?.missingSkills);
      return NextResponse.json({ source: "ia", subject: out.subject ?? "", text: out.text, advice: out.advice ?? [], analysis, checks });
      } catch (e) {
        console.error("[naya-ai] candidature → repli local", e);
        return local();
      }
    }

    /* ---------- Onglet Mes services ---------- */
    if (kind === "services") {
      const o = {
        service: String(body.service ?? "").slice(0, 200),
        clientType: String(body.clientType ?? "particulier"),
        sector: String(body.sector ?? "").slice(0, 120),
        need: String(body.need ?? "").slice(0, 1200),
        style: String(body.style ?? "whatsapp"),
        tone: String(body.tone ?? "naturel"),
        lang: (body.lang === "en" ? "en" : "fr") as Lang,
        extra: String(body.extra ?? "").slice(0, 1200),
        previous: String(body.previous ?? "").slice(0, 4000),
      };
      if (!o.service.trim()) return NextResponse.json({ error: "Indiquez le service à proposer." }, { status: 400 });
      const facts = profileFacts(profile, items);
      const local = () => NextResponse.json({ source: "local", ...localServices(profile, o), suggestions: [], checks: null });
      if (!ai) return local();
      try {
      const shape = {
        whatsapp: "un message WhatsApp de prospection de 80 à 140 mots, aéré, avec 2 ou 3 emojis sobres au maximum",
        proposition: "une proposition commerciale structurée (220 à 350 mots) : contexte et besoin du client, service proposé, déroulé, avantages concrets pour le client, pourquoi moi, prochaine étape",
        publication: "une publication Facebook/Instagram de 100 à 170 mots : accroche, services, atouts, appel à l'action",
      }[o.style] ?? "un message de prospection";
      const out = await chatJson<{ text: string; suggestions: string[] }>(
        [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content:
              `PROFIL (seuls faits utilisables) :\n${JSON.stringify(facts)}\n\n` +
              `SERVICE PROPOSÉ : ${o.service}\nCLIENT CIBLÉ : ${o.clientType}${o.sector ? `, secteur ${o.sector}` : ""}\n` +
              (o.need ? `BESOIN DU CLIENT : ${o.need}\n` : "BESOIN DU CLIENT : non précisé (reste général sur ce type de client, sans inventer de détails)\n") +
              (o.extra ? `INFOS DE L'UTILISATRICE (tarifs, zone, délais… faits utilisables) : ${o.extra}\n` : "") +
              (o.previous ? `\nVERSION PRÉCÉDENTE (propose une formulation différente) :\n"""${o.previous}"""\n` : "") +
              `\nTÂCHE : rédige ${shape}. Ton : ${TONES[o.tone] ?? TONES.naturel}. ${langLine(o.lang)}\n` +
              `Présente le service, explique les bénéfices pour CE client et son besoin, appuie-toi sur les compétences et réalisations réelles, termine par une invitation à prendre contact. N'invente ni tarif, ni client, ni chiffre. Pas de markdown.\n` +
              `Ajoute 3 suggestions concrètes (en français) pour améliorer la présentation de ce service (ex. réalisation à ajouter au portfolio, information manquante comme le tarif, preuve sociale à collecter).\n` +
              `JSON : {"text": "...", "suggestions": ["...", ...]}`,
          },
        ],
        { temperature: o.previous ? 0.85 : 0.6 },
      );
      const checks = await verify({ ...facts, infos: o.extra || undefined }, out.text);
      return NextResponse.json({ source: "ia", text: out.text, suggestions: out.suggestions ?? [], checks });
      } catch (e) {
        console.error("[naya-ai] services → repli local", e);
        return local();
      }
    }

    /* ---------- Onglet Rendez-vous ---------- */
    if (kind === "rendezvous") {
      const o = {
        situation: String(body.situation ?? "rdv_pro") as MeetingSituation,
        recipient: String(body.recipient ?? "").slice(0, 120),
        organization: String(body.organization ?? "").slice(0, 120),
        reason: String(body.reason ?? "").slice(0, 600),
        date: String(body.date ?? "").slice(0, 120),
        availability: String(body.availability ?? "").slice(0, 300),
        formality: String(body.formality ?? "cordial"),
        channel: body.channel === "whatsapp" ? "whatsapp" : "email",
        lang: (body.lang === "en" ? "en" : "fr") as Lang,
        extra: String(body.extra ?? "").slice(0, 1000),
        previous: String(body.previous ?? "").slice(0, 4000),
      };
      let opp: Opportunity | null = null;
      if (body.opportunityId) {
        const { data } = await ctx.sb.from("opportunities").select("*").eq("id", body.opportunityId).maybeSingle();
        opp = (data as Opportunity) ?? null;
      }
      if (!o.organization && opp) o.organization = opp.organization;
      const facts = profileFacts(profile, items);
      const local = () => NextResponse.json({ source: "local", ...localRendezvous(profile, o), checks: null });
      if (!ai) return local();
      try {

      const SITUATIONS: Record<MeetingSituation, string> = {
        rdv_pro: "une demande de rendez-vous professionnel",
        entretien_apres_candidature: "une demande d'entretien après l'envoi d'une candidature",
        rencontre_commerciale: "une proposition de rencontre commerciale pour présenter ses services",
        relance_contact: "une relance après une première prise de contact (rappelle brièvement l'échange)",
        relance_sans_reponse: "une relance polie après une absence de réponse, sans reproche",
        confirmation: "la confirmation d'un rendez-vous (rappelle date, lieu/moyen, et remercie)",
        report_annulation: "une demande de report ou d'annulation, avec excuses et proposition de nouvelles dates si des disponibilités sont fournies",
        preparation: "une fiche de préparation au rendez-vous : présentation de 30 secondes rédigée à la première personne, 5 questions probables avec pistes de réponse tirées du profil, 3 questions à poser, 2 conseils de sécurité (lieu public, jamais de frais à payer)",
      };
      const FORMALITY: Record<string, string> = { formel: "très formel (Madame, Monsieur ; formules soutenues)", cordial: "cordial et professionnel", simple: "simple et amical, tout en restant respectueux" };
      const isPrep = o.situation === "preparation";
      const out = await chatJson<{ subject: string; text: string }>(
        [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content:
              `PROFIL : ${JSON.stringify(facts)}\n\n` +
              (opp ? `MISSION CONCERNÉE : ${JSON.stringify({ intitule: opp.title, structure: opp.organization, description: opp.description, competences: opp.skills })}\n\n` : "") +
              `CONTEXTE : ${JSON.stringify({ destinataire: o.recipient || undefined, organisation: o.organization || undefined, motif: o.reason || undefined, date_souhaitee: o.date || undefined, disponibilites: o.availability || undefined, informations: o.extra || undefined })}\n\n` +
              (o.previous ? `VERSION PRÉCÉDENTE (formulation différente) :\n"""${o.previous}"""\n\n` : "") +
              `TÂCHE : rédige ${SITUATIONS[o.situation] ?? SITUATIONS.rdv_pro}. ` +
              (isPrep ? "" : `Niveau de formalité : ${FORMALITY[o.formality] ?? FORMALITY.cordial}. Canal : ${o.channel === "whatsapp" ? "WhatsApp (court, sans objet)" : "e-mail (avec objet)"}. Utilise le nom du destinataire s'il est fourni. N'invente ni date, ni lieu, ni heure non fournis. `) +
              `${langLine(o.lang)} Signe "${profile.full_name}". Pas de markdown.\n` +
              `JSON : {"subject": "objet (vide si WhatsApp ou fiche)", "text": "..."}`,
          },
        ],
        { temperature: o.previous ? 0.85 : 0.5 },
      );
      const checks = isPrep ? null : await verify({ ...facts, contexte: o }, out.text);
      return NextResponse.json({ source: "ia", subject: out.subject ?? "", text: out.text, checks });
      } catch (e) {
        console.error("[naya-ai] rendezvous → repli local", e);
        return local();
      }
    }

    /* ---------- Portfolio : organiser une présentation dictée ou écrite ---------- */
    if (kind === "portfolio_profile") {
      const raw = String(body.text ?? "").slice(0, 8000);
      if (!raw.trim()) return NextResponse.json({ error: "Dites ou écrivez d'abord quelques phrases sur vous." }, { status: 400 });
      if (!ai) return noAi();
      const out = await chatJson<Record<string, unknown>>([
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content:
            `Profil actuel : ${JSON.stringify(profileFacts(profile, items))}\n\n` +
            `Voici ce que l'utilisatrice vient de dire ou d'écrire sur elle :\n"""${raw}"""\n\n` +
            `Organise ces informations pour son portfolio professionnel. Utilise UNIQUEMENT ce qu'elle a dit et le profil actuel. Corrige la ponctuation et la grammaire.\n` +
            `- headline : un titre professionnel court (max 8 mots).\n- bio : présentation à la première personne, 60 à 110 mots, naturelle et professionnelle.\n` +
            `- experiences : ses expériences (même informelles), une par ligne, commençant par "• ".\n- education : formations et diplômes cités, une par ligne avec "• " (vide si rien).\n` +
            `- certifications : certifications citées (vide si rien).\n- skills : compétences citées ou évidentes d'après ses propos [{"name","category","kind":"technique"|"personnelle"|"outil"}].\n` +
            `- questions : 1 à 3 questions ciblées pour compléter ce qui manque (rôle exact, durée, résultats…).\n` +
            `JSON : {"headline","bio","experiences","education","certifications","skills":[],"questions":[]}`,
        },
      ]);
      return NextResponse.json({ source: "ia", ...out });
    }

    /* ---------- Portfolio : décrire un projet à partir des notes ---------- */
    if (kind === "project_describe") {
      const notes = String(body.notes ?? "").slice(0, 4000);
      const item = body.item ?? {};
      const captions = (Array.isArray(body.mediaCaptions) ? body.mediaCaptions : []).slice(0, 8);
      if (!ai) return noAi();
      const out = await chatJson<Record<string, unknown>>([
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content:
            `Projet / réalisation : ${JSON.stringify({ titre: item.title, description: item.description, categorie: item.category, objectifs: item.goals, role: item.role, outils: item.tools, resultats: item.results })}\n` +
            (notes ? `Notes de l'utilisatrice (dictées ou écrites) : """${notes}"""\n` : "") +
            (captions.length ? `Légendes des médias associés : ${JSON.stringify(captions)}\n` : "") +
            `\nRédige la fiche de ce projet pour un portfolio professionnel. N'invente JAMAIS le contexte, le client, son rôle ni des résultats : si une information n'est pas donnée, laisse le champ vide et pose une question.\n` +
            `JSON : {"title": "titre clair", "description": "60 à 120 mots", "goals": "", "role": "", "tools": [], "results": "", "category": "", "questions": ["..."]}`,
        },
      ]);
      return NextResponse.json({ source: "ia", ...out });
    }

    /* ---------- Portfolio : analyse multimodale d'une photo (ou d'une image clé de vidéo) ---------- */
    if (kind === "media_describe") {
      const image = String(body.image ?? "");
      const isVideo = body.mediaKind === "video";
      const userContext = String(body.context ?? "").slice(0, 1000);
      if (!/^(https:\/\/|data:image\/(jpeg|png|webp);base64,)/.test(image) || image.length > 6_000_000)
        return NextResponse.json({ error: "Image non prise en charge." }, { status: 400 });
      if (!ai) return noAi();
      const out = await chatJson<Record<string, unknown>>(
        [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  `Voici ${isVideo ? "une image extraite d'une vidéo" : "une photo"} importée par l'utilisatrice dans son portfolio (domaines : ${profile.skills.map((s) => s.category).filter((v, i, a) => a.indexOf(v) === i).join(", ") || "non précisés"}).\n` +
                  (userContext ? `Ce qu'elle en dit : """${userContext}"""\n` : "") +
                  `Décris uniquement ce qui est VISIBLE. N'invente jamais le contexte (client, événement, date), son rôle, ni des résultats : s'ils ne sont pas visibles ni indiqués, pose une question.\n` +
                  `JSON : {"title": "titre court", "caption": "légende professionnelle d'une phrase", "description": "40 à 80 mots", "keywords": ["3 à 6 mots-clés"], "category": "catégorie courte (ex. Couture & mode)", "visible": ["éléments visibles pertinents"], "questions": ["question ciblée", ...]}`,
              },
              { type: "image_url", image_url: image },
            ],
          },
        ],
        { model: MODELS.vision, temperature: 0.3, maxTokens: 900 },
      );
      return NextResponse.json({ source: "ia", ...out });
    }

    /* ---------- Mise en forme d'une dictée ---------- */
    if (kind === "clean_transcript") {
      const text = String(body.text ?? "").slice(0, 8000);
      if (!ai || !text.trim()) return NextResponse.json({ source: "local", text });
      const out = await chat(
        [
          { role: "system", content: "Tu corriges des transcriptions vocales en français. Tu ne changes pas le sens, tu n'ajoutes rien." },
          { role: "user", content: `Ajoute la ponctuation, les majuscules et des paragraphes, corrige les mots mal transcrits évidents. Réponds uniquement avec le texte corrigé.\n\n"""${text}"""` },
        ],
        { model: MODELS.fast, temperature: 0 },
      );
      return NextResponse.json({ source: "ia", text: out.replace(/^"+|"+$/g, "") });
    }

    return NextResponse.json({ error: "Requête inconnue" }, { status: 400 });
  } catch (e) {
    const busy = e instanceof MistralRateLimitError;
    if (busy) console.warn("[naya-ai]", kind, (e as Error).message);
    else console.error("[naya-ai]", kind, e);
    // Replis sans IA quand c'est possible.
    if (kind === "skills") return NextResponse.json({ source: "local", ...localExtractSkills(String(body.text ?? "")) });
    if (kind === "match_reasons") return NextResponse.json({ source: "local", reasons: {}, busy });
    if (kind === "clean_transcript") return NextResponse.json({ source: "local", text: String(body.text ?? "") });
    if (busy)
      return NextResponse.json({ error: "L'IA est très sollicitée en ce moment. Réessayez dans quelques minutes, ou remplissez les champs vous-même." }, { status: 503 });
    return NextResponse.json({ error: "L'assistante n'a pas pu répondre. Réessayez dans un instant." }, { status: 502 });
  }
}
