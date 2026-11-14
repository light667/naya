// Analyse de compatibilité profil ↔ mission.
// Le score est calculé ici, de façon déterministe, à partir de critères réels et pondérés.
// L'IA ne produit jamais ce pourcentage : elle s'appuie dessus pour rédiger.
import { RULES } from "./naya-local";
import type { Compatibility, CompatCriterion, Opportunity, PortfolioItem, Profile } from "./types";

export const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

const STOP = new Set(["de", "des", "du", "la", "le", "les", "et", "en", "pour", "avec", "sur", "une", "un", "au", "aux", "d", "l", "a"]);
const words = (s: string) => norm(s).split(" ").filter((w) => w.length >= 4 && !STOP.has(w));

/** Pondération : l'adéquation des compétences compte le plus. */
export const WEIGHTS = { skills: 50, domain: 15, evidence: 15, location: 10, availability: 10 } as const;

type ProfileLike = Pick<Profile, "skills" | "interests" | "city" | "availability" | "experiences" | "bio"> &
  Partial<Pick<Profile, "education" | "certifications">>;
type ItemLike = Pick<PortfolioItem, "title" | "description"> & Partial<Pick<PortfolioItem, "category" | "role" | "results">>;

/** Mots-clés associés à une compétence (via les règles du moteur local), pour reconnaître les synonymes. */
function keysFor(skill: string): string[] {
  const n = norm(skill);
  const out = new Set<string>([n]);
  for (const r of RULES) {
    const rn = norm(r.skill.name);
    if (rn === n || rn.includes(n) || n.includes(rn) || r.keys.some((k) => norm(k) === n)) {
      out.add(rn);
      r.keys.forEach((k) => out.add(norm(k)));
    }
  }
  return [...out].filter((k) => k.length >= 3);
}

function sameSkill(a: string, b: string): boolean {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  if (x === y || x.includes(y) || y.includes(x)) return true;
  const wx = words(a), wy = words(b);
  return wx.some((w) => wy.some((v) => w === v || (w.length >= 5 && v.length >= 5 && (w.startsWith(v.slice(0, 5)) || v.startsWith(w.slice(0, 5))))));
}

const SCHEDULE = /(week ?end|samedi|dimanche|soir|soiree|temps plein|plein temps|temps partiel|mi temps|matin|apres midi|lundi|mardi|mercredi|jeudi|vendredi|horaires?)/;

export function computeCompatibility(profile: ProfileLike, opp: Opportunity, items: ItemLike[] = []): Compatibility {
  const criteria: CompatCriterion[] = [];
  const strengths: string[] = [];
  const gaps: string[] = [];
  const tips: string[] = [];
  const questions: { id: string; question: string }[] = [];
  const missingData: string[] = [];

  const sources: { label: string; text: string }[] = [
    { label: "vos expériences", text: profile.experiences || "" },
    { label: "votre présentation", text: profile.bio || "" },
    { label: "votre formation", text: profile.education || "" },
    { label: "vos certifications", text: profile.certifications || "" },
    ...items.map((i) => ({ label: `votre réalisation « ${i.title} »`, text: [i.title, i.description, i.category, i.role, i.results].filter(Boolean).join(" ") })),
  ].filter((s) => s.text.trim());

  /* ---- 1. Compétences demandées ---- */
  const matchedSkills: { skill: string; via: string }[] = [];
  const partialSkills: { skill: string; via: string }[] = [];
  const missingSkills: string[] = [];
  const reqSkills = opp.skills.filter((s) => s.trim());

  for (const req of reqSkills) {
    const direct = profile.skills.find((s) => sameSkill(s.name, req));
    if (direct) { matchedSkills.push({ skill: req, via: `compétence « ${direct.name} »${direct.level ? ` (${direct.level})` : ""}` }); continue; }
    const keys = keysFor(req);
    const viaSyn = profile.skills.find((s) => keys.some((k) => sameSkill(s.name, k)));
    if (viaSyn) { matchedSkills.push({ skill: req, via: `compétence proche « ${viaSyn.name} »` }); continue; }
    const mention = sources.find((src) => { const t = ` ${norm(src.text)} `; return keys.some((k) => t.includes(` ${k}`)); });
    if (mention) { partialSkills.push({ skill: req, via: `mentionnée dans ${mention.label}` }); continue; }
    missingSkills.push(req);
  }

  if (reqSkills.length) {
    const ratio = (matchedSkills.length + 0.5 * partialSkills.length) / reqSkills.length;
    criteria.push({
      id: "skills", label: "Compétences demandées", weight: WEIGHTS.skills, earned: Math.round(WEIGHTS.skills * ratio * 10) / 10,
      detail: `${matchedSkills.length} sur ${reqSkills.length} dans votre profil${partialSkills.length ? `, ${partialSkills.length} évoquée${partialSkills.length > 1 ? "s" : ""} sans être listée${partialSkills.length > 1 ? "s" : ""}` : ""}`,
    });
    if (matchedSkills.length) strengths.push(`Vous avez ${matchedSkills.length > 1 ? "les compétences" : "la compétence"} ${matchedSkills.map((m) => `« ${m.skill} »`).join(", ")} demandée${matchedSkills.length > 1 ? "s" : ""}.`);
    for (const p of partialSkills) tips.push(`« ${p.skill} » est ${p.via} mais pas dans vos compétences : ajoutez-la à votre profil.`);
    if (missingSkills.length) gaps.push(`Absente${missingSkills.length > 1 ? "s" : ""} de votre profil : ${missingSkills.map((s) => `« ${s} »`).join(", ")}.`);
    missingSkills.slice(0, 3).forEach((s, i) => questions.push({ id: `skill-${i}`, question: `Avez-vous déjà pratiqué « ${s} » ? Si oui, décrivez une situation précise.` }));
  } else {
    missingData.push("La mission ne précise pas les compétences recherchées.");
  }

  /* ---- 2. Domaine ---- */
  const cat = norm(opp.category);
  const domainSkill = profile.skills.find((s) => norm(s.category) === cat);
  const domainItem = items.find((i) => i.category && norm(i.category) === cat);
  const domainInterest = profile.interests.find((i) => cat.includes(norm(i)) || norm(i).includes(cat));
  const domainOk = !!(domainSkill || domainItem || domainInterest);
  criteria.push({
    id: "domain", label: "Domaine de la mission", weight: WEIGHTS.domain, earned: domainOk ? WEIGHTS.domain : 0,
    detail: domainSkill ? `${opp.category} fait partie de vos domaines` : domainItem ? `réalisation dans le domaine ${opp.category}` : domainInterest ? `rejoint votre centre d'intérêt « ${domainInterest} »` : `aucun élément dans le domaine ${opp.category}`,
  });
  if (domainOk) strengths.push(`La mission est dans votre domaine (${opp.category}).`);

  /* ---- 3. Preuves concrètes (expériences, réalisations, formation) ---- */
  const evidenceKeys = [...new Set([...reqSkills.flatMap(keysFor), ...words(opp.category), ...words(opp.title)])];
  const evidence = sources.filter((src) => { const t = ` ${norm(src.text)} `; return evidenceKeys.some((k) => t.includes(` ${k}`)); });
  const hasAnyBackground = sources.length > 0;
  if (hasAnyBackground) {
    const earned = evidence.length >= 2 ? WEIGHTS.evidence : evidence.length === 1 ? Math.round(WEIGHTS.evidence * 0.6) : 0;
    criteria.push({
      id: "evidence", label: "Expériences et réalisations liées", weight: WEIGHTS.evidence, earned,
      detail: evidence.length ? `en lien : ${evidence.slice(0, 3).map((e) => e.label).join(", ")}` : "aucune expérience décrite en lien direct",
    });
    if (evidence.length) strengths.push(`Expérience concrète à valoriser : ${evidence.slice(0, 2).map((e) => e.label).join(" et ")}.`);
    else gaps.push("Aucune expérience ou réalisation décrite ne se rapporte directement à cette mission.");
  } else {
    missingData.push("Votre profil ne décrit encore aucune expérience ni réalisation.");
    questions.push({ id: "exp", question: "Quelle expérience, même informelle (famille, quartier, association), se rapproche de cette mission ?" });
  }
  if (!items.length) tips.push(`Ajoutez à votre portfolio une réalisation en ${opp.category.toLowerCase()} : une photo rassure le recruteur.`);
  else if (!domainItem && !evidence.some((e) => e.label.startsWith("votre réalisation"))) tips.push(`Aucune de vos réalisations ne concerne ${opp.category.toLowerCase()} : ajoutez-en une si vous le pouvez.`);

  /* ---- 4. Lieu ---- */
  if (opp.remote) {
    criteria.push({ id: "location", label: "Lieu", weight: WEIGHTS.location, earned: WEIGHTS.location, detail: "mission possible à distance" });
  } else if (profile.city?.trim()) {
    const cityWord = words(profile.city)[0] ?? norm(profile.city);
    const near = norm(opp.location).includes(cityWord) || norm(profile.city).includes(norm(opp.location).split(" ")[0] ?? "");
    criteria.push({ id: "location", label: "Lieu", weight: WEIGHTS.location, earned: near ? WEIGHTS.location : 3, detail: near ? `même ville (${opp.location})` : `mission à ${opp.location}, vous êtes à ${profile.city}` });
    if (near) strengths.push(`Vous habitez près du lieu de la mission (${opp.location}).`);
    else gaps.push(`La mission se déroule à ${opp.location} : précisez si vous pouvez vous déplacer.`);
  } else {
    missingData.push("Votre ville n'est pas renseignée.");
    questions.push({ id: "city", question: `Pouvez-vous vous rendre à ${opp.location || "le lieu de la mission"} ?` });
  }

  /* ---- 5. Disponibilités ---- */
  const oppText = norm(`${opp.title} ${opp.description}`);
  const sched = oppText.match(SCHEDULE)?.[0];
  if (sched) {
    if (profile.availability?.trim()) {
      const av = norm(profile.availability);
      const conflict = /(plein temps|temps plein)/.test(oppText) && /(week|soir|ponctuel)/.test(av);
      const fit = (/week ?end|samedi|dimanche/.test(oppText) && /week/.test(av)) || (/soir/.test(oppText) && /soir/.test(av)) || /plein/.test(av) ||
        (/(partiel|mi temps)/.test(oppText) && /(partiel|week|soir)/.test(av));
      const earned = conflict ? 2 : fit ? WEIGHTS.availability : 6;
      criteria.push({ id: "availability", label: "Disponibilités", weight: WEIGHTS.availability, earned, detail: conflict ? `la mission demande « ${sched} », vous êtes disponible ${profile.availability.toLowerCase()}` : fit ? "vos disponibilités correspondent" : "à confirmer avec le recruteur" });
      if (conflict) gaps.push("Vos disponibilités semblent ne pas correspondre au rythme demandé.");
    } else {
      missingData.push("Vos disponibilités ne sont pas renseignées.");
      questions.push({ id: "availability", question: "Quand êtes-vous disponible pour cette mission ?" });
    }
  }

  /* ---- Synthèse ---- */
  const applicable = criteria.reduce((a, c) => a + c.weight, 0);
  const earned = criteria.reduce((a, c) => a + c.earned, 0);
  const tooThinProfile = profile.skills.length === 0 && !hasAnyBackground;
  const tooThinMission = reqSkills.length === 0 && opp.description.trim().length < 40;
  const complete = !tooThinProfile && !tooThinMission && applicable >= 60;
  if (tooThinProfile) missingData.unshift("Votre profil ne contient ni compétence ni expérience : impossible d'évaluer la correspondance.");

  if (missingSkills.length && matchedSkills.length) tips.push("Dans votre message, appuyez-vous d'abord sur les compétences que vous avez déjà, puis montrez votre envie d'apprendre le reste.");

  return {
    complete,
    score: complete ? Math.round((earned / applicable) * 100) : null,
    criteria,
    matchedSkills,
    partialSkills,
    missingSkills,
    strengths,
    gaps,
    tips: [...new Set(tips)].slice(0, 5),
    questions: questions.slice(0, 4),
    missingData,
  };
}

/** Résumé court d'une analyse, pour les cartes de missions. */
export function compatReason(c: Compatibility): string {
  if (!c.complete) return "Analyse incomplète : complétez votre profil pour obtenir un score.";
  const parts: string[] = [];
  if (c.matchedSkills.length) parts.push(`vous maîtrisez ${c.matchedSkills.map((m) => m.skill).slice(0, 3).join(", ")}`);
  const dom = c.criteria.find((x) => x.id === "domain");
  if (dom?.earned) parts.push("dans votre domaine");
  const loc = c.criteria.find((x) => x.id === "location");
  if (loc?.earned === loc?.weight) parts.push(loc!.detail);
  if (c.missingSkills.length) parts.push(`à renforcer : ${c.missingSkills.slice(0, 2).join(", ")}`);
  const s = parts.join(" · ") || "peu d'éléments en commun avec votre profil";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
