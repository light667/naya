// Compétences : liste unique de catégories, validation stricte de la réponse de l'IA, fusion sans écrasement.
// Ce fichier ne dépend ni du navigateur ni du serveur : il est utilisé des deux côtés et testé.
import type { Skill, SkillLevel, SkillSource, SkillStatus } from "./types";

/** Liste unique des catégories métier (utilisée partout). `icon` renvoie au pictogramme de SkillIcon. */
export const CATEGORIES = [
  { id: "Couture & Mode", icon: "needle", keys: ["coutur", "mode", "textile", "confection", "wax", "pagne", "tailleur", "retouche"] },
  { id: "Commerce & Vente", icon: "basket", keys: ["commerce", "vente", "vendre", "client", "marché", "boutique", "négoci"] },
  { id: "Artisanat", icon: "hammer", keys: ["artisan", "cuir", "bois", "menuis", "perle", "bijou", "poterie", "soudure"] },
  { id: "Digital & Tech", icon: "phone", keys: ["digital", "numérique", "réseaux", "informatique", "tech", "graphi", "photo", "vidéo", "communication"] },
  { id: "Agroalimentaire", icon: "sprout", keys: ["agro", "agricult", "transformation", "élevage", "récolte", "farine", "jus"] },
  { id: "Cuisine & Traiteur", icon: "pot", keys: ["cuisin", "traiteur", "pâtiss", "repas", "restaur"] },
  { id: "Gestion & Devis", icon: "calculator", keys: ["gestion", "devis", "compta", "caisse", "budget", "tontine", "argent", "stock", "administr"] },
  { id: "Éducation", icon: "book", keys: ["éducation", "enseign", "cours", "soutien", "enfant", "garde", "formation"] },
  { id: "Beauté & Bien-être", icon: "comb", keys: ["beauté", "coiff", "tresse", "esthéti", "maquill", "ongle", "bien-être"] },
  { id: "Savoir-être", icon: "heart", keys: ["savoir-être", "relation", "organisation", "ponctual", "écoute", "équipe", "patience", "autonom"] },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export type IconId = (typeof CATEGORIES)[number]["icon"];
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as CategoryId[];

const strip = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Ramène une catégorie libre (« couture et mode », « Communication digitale »…) vers la liste unique. */
export function normalizeCategory(raw: unknown, skillName = ""): CategoryId {
  const v = strip(String(raw ?? ""));
  const exact = CATEGORIES.find((c) => strip(c.id) === v);
  if (exact) return exact.id;
  const hay = `${v} ${strip(skillName)}`;
  const hit = CATEGORIES.find((c) => c.keys.some((k) => hay.includes(strip(k))));
  return hit?.id ?? "Savoir-être";
}

export const iconFor = (category: string): IconId => CATEGORIES.find((c) => c.id === normalizeCategory(category))?.icon ?? "heart";

export const LEVELS: SkillLevel[] = ["débutante", "intermédiaire", "confirmée"];
export const LEVEL_LABEL: Record<SkillLevel, string> = { débutante: "Je débute", intermédiaire: "Je me débrouille", confirmée: "J'ai de l'expérience" };

export function normalizeLevel(raw: unknown): SkillLevel {
  const v = strip(String(raw ?? ""));
  if (/debut|novice|apprend/.test(v)) return "débutante";
  if (/confirm|expert|avanc|experiment/.test(v)) return "confirmée";
  return "intermédiaire";
}

export const STATUS_LABEL: Record<SkillStatus, string> = {
  declaree: "Déclarée",
  confirmee_assistant: "Confirmée par l'assistant",
  validee_mentor: "Validée par un mentor",
};
const STATUS_RANK: Record<SkillStatus, number> = { declaree: 0, confirmee_assistant: 1, validee_mentor: 2 };

/** Schéma imposé à Gemini (sous-ensemble OpenAPI) : la réponse est du JSON, pas du texte libre. */
export const SKILLS_SCHEMA = {
  type: "OBJECT",
  properties: {
    skills: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING", description: "Compétence concrète, 2 à 5 mots" },
          category: { type: "STRING", enum: [...CATEGORY_IDS] },
          level: { type: "STRING", enum: [...LEVELS] },
          evidence: { type: "STRING", description: "Une phrase tirée de ce que la personne a dit" },
        },
        required: ["name", "category", "level", "evidence"],
      },
    },
  },
  required: ["skills"],
} as const;

/**
 * Valide et nettoie la réponse de l'IA. Accepte quelques variantes (nom/name, niveau/level, tableau direct),
 * rejette le reste. `valid` est faux si la forme attendue n'est pas là du tout (on réessaie alors une fois).
 */
export function parseSkills(raw: unknown, meta: { source: SkillSource; status: SkillStatus; now?: string }): { valid: boolean; skills: Skill[] } {
  let data: unknown = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, ""));
    } catch {
      return { valid: false, skills: [] };
    }
  }
  const list = Array.isArray(data) ? data : data && typeof data === "object" ? (data as Record<string, unknown>).skills ?? (data as Record<string, unknown>).competences : null;
  if (!Array.isArray(list)) return { valid: false, skills: [] };

  const now = meta.now ?? new Date().toISOString();
  const seen = new Set<string>();
  const skills: Skill[] = [];
  for (const item of list) {
    const o: Record<string, unknown> = typeof item === "string" ? { name: item } : item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const name = String(o.name ?? o.nom ?? o.skill ?? o.competence ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
    if (name.length < 2 || seen.has(strip(name))) continue;
    seen.add(strip(name));
    const evidence = String(o.evidence ?? o.preuve ?? "").trim().slice(0, 200);
    skills.push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      category: normalizeCategory(o.category ?? o.categorie ?? o.catégorie, name),
      level: normalizeLevel(o.level ?? o.niveau),
      ...(evidence ? { evidence } : {}),
      source: meta.source,
      status: meta.status,
      added_at: now,
    });
    if (skills.length >= 10) break;
  }
  return { valid: true, skills };
}

/** Ajoute les nouvelles compétences sans jamais retirer ni écraser celles qui existent. */
export function mergeSkills(existing: Skill[], incoming: Skill[]): { skills: Skill[]; added: Skill[] } {
  const out = existing.map((s) => ({ ...s }));
  const added: Skill[] = [];
  for (const n of incoming) {
    const i = out.findIndex((s) => strip(s.name) === strip(n.name));
    if (i === -1) {
      out.push(n);
      added.push(n);
      continue;
    }
    // Déjà là : on garde le niveau choisi par la personne, on ne fait que monter le statut et compléter la preuve.
    const cur = out[i];
    const curRank = STATUS_RANK[cur.status ?? "declaree"];
    if (n.status && STATUS_RANK[n.status] > curRank) cur.status = n.status;
    if (!cur.evidence && n.evidence) cur.evidence = n.evidence;
  }
  return { skills: out, added };
}

/** Compétences proposées qui ne sont pas encore dans le profil. */
export const newOnly = (existing: Skill[], incoming: Skill[]) => incoming.filter((n) => !existing.some((s) => strip(s.name) === strip(n.name)));
