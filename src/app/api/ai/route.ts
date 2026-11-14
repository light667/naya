import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { localExtractSkills, localMatch, localWrite } from "@/lib/naya-local";
import type { Opportunity, Profile, WriteMode } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = "claude-opus-5-5";

const SYSTEM = `Tu es l'assistante IA de NAYA, une plateforme qui aide les jeunes femmes de 18 à 30 ans (principalement au Togo et en Afrique de l'Ouest francophone) à identifier, valoriser et commercialiser leurs compétences.
Principes :
- Tu valorises aussi les compétences informelles (aide familiale, petit commerce, tontine, associations, église, garde d'enfants, réseaux sociaux…).
- Ton chaleureux, encourageant, concret, jamais condescendant. Français simple. Tutoiement interdit : vouvoie.
- Tu ne promets jamais d'emploi ni de revenu garanti ; tu aides à décider, la décision reste humaine.
- Contexte économique local (FCFA, Lomé, WhatsApp/Facebook très utilisés).`;

function client() {
  return process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
}

async function ask(c: Anthropic, prompt: string, schema?: Record<string, unknown>, maxTokens = 4000): Promise<string> {
  const res = await c.beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM,
    output_config: { effort: "low", ...(schema ? { format: { type: "json_schema", schema } } : {}) },
    messages: [{ role: "user", content: prompt }],
  });
  if (res.stop_reason === "refusal") throw new Error("refusal");
  return res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
}

const SKILLS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "skills", "suggestions"],
  properties: {
    summary: { type: "string" },
    skills: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "category", "level"],
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          level: { type: "string", enum: ["débutante", "intermédiaire", "confirmée"] },
        },
      },
    },
    suggestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "firstStep"],
        properties: { title: { type: "string" }, description: { type: "string" }, firstStep: { type: "string" } },
      },
    },
  },
};

const MATCH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["matches"],
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["opportunityId", "score", "reason"],
        properties: { opportunityId: { type: "string" }, score: { type: "integer" }, reason: { type: "string" } },
      },
    },
  },
};

export async function POST(req: Request) {
  // Seules les utilisatrices connectées peuvent appeler l'IA.
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return NextResponse.json({ error: "Non connectée" }, { status: 401 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ error: "Session invalide" }, { status: 401 });

  const body = await req.json();
  const kind = body.kind as "skills" | "match" | "write";
  const c = client();

  try {
    if (kind === "skills") {
      const text = String(body.text ?? "").slice(0, 6000);
      if (!c) return NextResponse.json({ source: "local", ...localExtractSkills(text) });
      const out = await ask(
        c,
        `Voici les réponses d'une utilisatrice au questionnaire de découverte de compétences :\n\n${text}\n\n` +
          `1. Identifie 4 à 10 compétences concrètes (techniques et savoir-être), y compris informelles. Catégories courtes (ex. "Couture & mode", "Communication digitale", "Savoir-être").\n` +
          `2. Propose 3 activités rémunératrices réalistes localement, chacune avec un premier pas faisable cette semaine.\n` +
          `3. Rédige un résumé encourageant de 2 phrases.`,
        SKILLS_SCHEMA,
      );
      return NextResponse.json({ source: "ia", ...JSON.parse(out) });
    }

    if (kind === "match") {
      const profile = body.profile as Profile;
      const opps = (body.opportunities as Opportunity[]).slice(0, 40);
      if (!c) return NextResponse.json({ source: "local", matches: localMatch(profile, opps) });
      const out = await ask(
        c,
        `Profil :\n${JSON.stringify({ ville: profile.city, competences: profile.skills, interets: profile.interests, disponibilites: profile.availability, experiences: profile.experiences })}\n\n` +
          `Opportunités :\n${JSON.stringify(opps.map((o) => ({ id: o.id, titre: o.title, categorie: o.category, competences: o.skills, lieu: o.location, distance: o.remote, description: o.description })))}\n\n` +
          `Pour CHAQUE opportunité, donne un score de pertinence de 0 à 100 et une raison courte (max 20 mots) qui parle à l'utilisatrice ("vous…"). Utilise les id exacts.`,
        MATCH_SCHEMA,
      );
      const parsed = JSON.parse(out) as { matches: { opportunityId: string; score: number; reason: string }[] };
      return NextResponse.json({ source: "ia", matches: parsed.matches.sort((a, b) => b.score - a.score) });
    }

    if (kind === "write") {
      const mode = body.mode as WriteMode;
      const profile = body.profile as Profile;
      const opp = (body.opportunity ?? null) as Opportunity | null;
      const extra = String(body.extra ?? "").slice(0, 1000);
      if (!c) return NextResponse.json({ source: "local", text: localWrite(mode, profile, opp, extra) });
      const task = {
        candidature: "Rédige un message de candidature court (150-220 mots), personnel et concret, prêt à envoyer par email ou WhatsApp. Commence par une ligne « Objet : ».",
        presentation: "Rédige une présentation de services attractive (150-200 mots) que l'utilisatrice peut publier sur WhatsApp/Facebook : accroche, services, atouts, appel à l'action. Quelques emojis sobres.",
        entretien: "Prépare-la à un échange avec un recruteur ou une cliente : pitch de 30 s rédigé pour elle, 5 questions probables avec pistes de réponse basées sur son profil, 3 questions à poser, et 2 conseils de sécurité (lieu public, jamais de frais à payer).",
      }[mode];
      const text = await ask(
        c,
        `Profil de l'utilisatrice :\n${JSON.stringify({ nom: profile.full_name, titre: profile.headline, ville: profile.city, bio: profile.bio, experiences: profile.experiences, competences: profile.skills, disponibilites: profile.availability })}\n\n` +
          (opp ? `Opportunité visée :\n${JSON.stringify({ titre: opp.title, organisation: opp.organization, description: opp.description, competences: opp.skills, remuneration: opp.pay })}\n\n` : "") +
          (extra ? `Précisions de l'utilisatrice : ${extra}\n\n` : "") +
          `${task}\nN'invente aucune expérience absente du profil. Réponds uniquement avec le texte final, sans markdown.`,
      );
      return NextResponse.json({ source: "ia", text });
    }

    return NextResponse.json({ error: "Requête inconnue" }, { status: 400 });
  } catch (e) {
    console.error("[naya-ai]", e);
    // Repli silencieux sur le moteur local pour ne jamais bloquer l'utilisatrice
    if (kind === "skills") return NextResponse.json({ source: "local", ...localExtractSkills(String(body.text ?? "")) });
    if (kind === "match") return NextResponse.json({ source: "local", matches: localMatch(body.profile, body.opportunities) });
    return NextResponse.json({ source: "local", text: localWrite(body.mode, body.profile, body.opportunity, body.extra) });
  }
}
