// Textes de repli quand l'IA n'est pas configurée ou indisponible.
// Ils n'utilisent que les données réelles du profil et de la mission ; rien n'est inventé.
import type { Compatibility, Lang, MeetingSituation, Opportunity, Profile } from "./types";

const list = (a: string[]) => (a.length <= 1 ? a.join("") : `${a.slice(0, -1).join(", ")} et ${a[a.length - 1]}`);

export function localCandidature(p: Profile, opp: Opportunity | null, a: Compatibility | null, o: { format: string; channel: string; lang: Lang; extra: string; organization?: string }) {
  const org = opp?.organization || o.organization || "";
  const matched = a?.matchedSkills.map((m) => m.skill.toLowerCase()) ?? [];
  const skills = matched.length ? matched : p.skills.slice(0, 3).map((s) => s.name.toLowerCase());
  const en = o.lang === "en";
  const hello = o.channel === "whatsapp" ? (en ? "Hello" : "Bonjour") : en ? `Dear ${org || "Sir or Madam"},` : `Madame, Monsieur${org ? ` de ${org}` : ""},`;
  const subject = en ? `Application – ${opp?.title ?? "spontaneous application"}` : `Candidature – ${opp?.title ?? "candidature spontanée"}`;
  const body = en
    ? [
        hello,
        `My name is ${p.full_name}${p.city ? `, I live in ${p.city}` : ""}. I am applying ${opp ? `for the "${opp.title}" mission` : `to join ${org || "your organisation"}`}.`,
        skills.length ? `My profile includes: ${list(skills)}.` : "",
        p.experiences ? `Experience: ${p.experiences.trim()}` : "",
        o.extra,
        p.availability ? `Availability: ${p.availability}.` : "",
        "I would be glad to discuss this with you.",
        p.full_name,
      ]
    : [
        hello,
        `Je m'appelle ${p.full_name}${p.city ? `, j'habite à ${p.city}` : ""}. Je vous propose ma candidature ${opp ? `pour la mission « ${opp.title} »` : `${org ? `au sein de ${org}` : "spontanée"}`}.`,
        skills.length ? `Mon profil correspond à vos besoins sur ces points : ${list(skills)}.` : "",
        p.experiences ? `Mon expérience : ${p.experiences.trim()}` : "",
        o.extra,
        p.availability ? `Je suis disponible ${p.availability.toLowerCase()}.` : "",
        "Je serais heureuse d'échanger avec vous.",
        `Bien cordialement,\n${p.full_name}`,
      ];
  return { subject, text: body.filter(Boolean).join("\n\n") };
}

export function localServices(p: Profile, o: { service: string; clientType: string; need: string; sector: string; extra: string }) {
  const text = [
    `${p.full_name}${p.headline ? ` — ${p.headline}` : ""}`,
    `Je propose : ${o.service}${o.sector ? ` pour le secteur ${o.sector}` : ""}.`,
    o.need ? `Votre besoin : ${o.need}. Je peux vous aider sur ce point.` : "",
    p.skills.length ? `Mes compétences : ${list(p.skills.slice(0, 5).map((s) => s.name))}.` : "",
    p.experiences ? `Mon expérience : ${p.experiences.trim()}` : "",
    o.extra,
    `${p.city ? `Basée à ${p.city}. ` : ""}Contactez-moi pour en parler.`,
  ];
  return { text: text.filter(Boolean).join("\n\n") };
}

const SITUATION_FR: Record<MeetingSituation, string> = {
  rdv_pro: "solliciter un rendez-vous professionnel",
  entretien_apres_candidature: "demander un entretien suite à ma candidature",
  rencontre_commerciale: "vous proposer une rencontre pour présenter mes services",
  relance_contact: "faire suite à notre premier échange",
  relance_sans_reponse: "revenir vers vous, n'ayant pas encore eu de réponse",
  confirmation: "confirmer notre rendez-vous",
  report_annulation: "vous demander de reporter notre rendez-vous",
  preparation: "préparer notre rendez-vous",
};

export function localRendezvous(p: Profile, o: { situation: MeetingSituation; recipient: string; organization: string; reason: string; date: string; availability: string; extra: string }) {
  if (o.situation === "preparation") {
    return {
      subject: "",
      text: [
        `Préparer votre rendez-vous${o.organization ? ` avec ${o.organization}` : ""}`,
        `1. Présentation (30 s) : qui vous êtes, ce que vous savez faire${p.skills.length ? ` (${list(p.skills.slice(0, 3).map((s) => s.name.toLowerCase()))})` : ""}, pourquoi ce rendez-vous vous intéresse.`,
        "2. Deux exemples concrets tirés de vos expériences.",
        "3. Questions à poser : déroulé, délais, mode de paiement.",
        "4. Sécurité : lieu public ou connu, prévenez un proche, ne payez jamais de frais.",
      ].join("\n\n"),
    };
  }
  const text = [
    `Bonjour${o.recipient ? ` ${o.recipient}` : ""},`,
    `Je me permets de vous écrire pour ${SITUATION_FR[o.situation]}${o.reason ? ` (${o.reason})` : ""}.`,
    o.date ? `Je vous propose le ${o.date}.` : "",
    o.availability ? `Mes disponibilités : ${o.availability}.` : "",
    o.extra,
    "Merci pour votre retour.",
    `Bien cordialement,\n${p.full_name}`,
  ];
  return { subject: `Rendez-vous${o.organization ? ` – ${o.organization}` : ""}`, text: text.filter(Boolean).join("\n\n") };
}
