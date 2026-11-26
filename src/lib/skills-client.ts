"use client";
// Enregistrement des compétences côté navigateur : fusion sans écrasement, erreurs remontées, file d'attente pour les visiteurs.
import { supabase } from "./supabase";
import { mergeSkills } from "./skills";
import type { Profile, Skill } from "./types";

const PENDING_KEY = "phar_pending_skills";

/** Ajoute des compétences au profil. Renvoie le profil à jour ou lève une erreur lisible. */
export async function addSkillsToProfile(profile: Profile, incoming: Skill[]): Promise<{ profile: Profile; added: Skill[] }> {
  const { skills, added } = mergeSkills(Array.isArray(profile.skills) ? profile.skills : [], incoming);
  if (!added.length && skills.length === profile.skills.length) return { profile, added };
  return { profile: await writeSkills(profile, skills), added };
}

/** Remplace la liste (modification manuelle : renommer, supprimer, changer le niveau). */
export async function writeSkills(profile: Profile, skills: Skill[]): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").update({ skills }).eq("id", profile.id).select().single();
  if (error) throw new Error("L'enregistrement n'a pas marché. Vérifie ta connexion et réessaie.");
  return data as Profile;
}

/** Visiteur sans compte : on garde les compétences trouvées sur l'appareil jusqu'à l'inscription. */
export function readPending(): Skill[] {
  try {
    const v = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
export function writePending(skills: Skill[]) {
  try {
    if (skills.length) localStorage.setItem(PENDING_KEY, JSON.stringify(skills.slice(0, 30)));
    else localStorage.removeItem(PENDING_KEY);
  } catch {
    /* stockage indisponible (navigation privée) */
  }
}
