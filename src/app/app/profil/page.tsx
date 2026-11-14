"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Button, ButtonLink, Empty, Input, Select, Tabs } from "@/components/ui";
import { PortfolioBuilder } from "@/components/portfolio/PortfolioBuilder";
import { FieldWithMic } from "@/components/portfolio/StepPresentation";
import { supabase } from "@/lib/supabase";
import type { Profile, Skill } from "@/lib/types";

type Tab = "profil" | "competences" | "portfolio";
const LEVELS: NonNullable<Skill["level"]>[] = ["débutante", "intermédiaire", "confirmée"];

function ProfilInner() {
  const { profile, setProfile, session } = useAuth();
  const toast = useToast();
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "profil");
  const [form, setForm] = useState<Profile | null>(profile);
  const [interestsText, setInterestsText] = useState(profile?.interests.join(", ") ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    setForm(profile);
    setInterestsText(profile?.interests.join(", ") ?? "");
  }, [profile]);

  if (!form) return null;

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => { setForm({ ...form, [k]: v }); setDirty(true); };

  async function save() {
    setSaving(true);
    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: form!.full_name, headline: form!.headline, city: form!.city, bio: form!.bio, experiences: form!.experiences, interests: form!.interests, availability: form!.availability, skills: form!.skills })
      .eq("id", form!.id)
      .select()
      .single();
    setSaving(false);
    if (error) return toast(`Enregistrement impossible : ${error.message}`, "error");
    setProfile(data as Profile);
    setDirty(false);
    toast("Profil enregistré");
  }

  const addSkill = () => {
    const n = newSkill.trim();
    if (!n || form.skills.some((s) => s.name.toLowerCase() === n.toLowerCase())) return;
    set("skills", [...form.skills, { name: n, category: "Autre", level: "intermédiaire" }]);
    setNewSkill("");
  };
  const setLevel = (name: string, level: Skill["level"]) => set("skills", form.skills.map((s) => (s.name === name ? { ...s, level } : s)));
  const initials = (form.full_name || session?.user.email || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div>
      {/* Carte d'identité : ce que verra un recruteur */}
      <section className="flex flex-col gap-5 rounded-[30px] bg-white p-6 ring-1 ring-line sm:flex-row sm:items-center sm:p-8">
        {form.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.avatar_url} alt="" className="h-20 w-20 shrink-0 rounded-[26px] object-cover" />
        ) : (
          <span className="font-display flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] bg-plum text-[30px] text-white">{initials}</span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[30px] text-plum sm:text-[38px]">{form.full_name || "Votre nom"}</h1>
          <p className="mt-1 text-[17px] text-ink">{form.headline || <span className="text-muted">Ajoutez un titre, par exemple « Couturière et créatrice en pagne »</span>}</p>
          <p className="mt-1 text-sm text-muted">{[form.city, form.availability].filter(Boolean).join(", ") || "Ville et disponibilités à préciser"}</p>
        </div>
      </section>

      <div className="mt-6">
        <Tabs
          tabs={[
            { id: "profil", label: "Mon profil" },
            { id: "competences", label: `Compétences (${form.skills.length})` },
            { id: "portfolio", label: "Portfolio" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-6">
          {tab === "profil" && (
            <div className="grid gap-4 rounded-[22px] bg-white p-5 ring-1 ring-line sm:grid-cols-2 sm:p-6">
              <Input label="Prénom et nom" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
              <Input label="Titre" placeholder="Couturière et créatrice en pagne" value={form.headline} onChange={(e) => set("headline", e.target.value)} />
              <Input label="Ville ou quartier" placeholder="Lomé, Bè" value={form.city} onChange={(e) => set("city", e.target.value)} />
              <Select label="Disponibilités" value={form.availability} onChange={(e) => set("availability", e.target.value)}>
                <option value="">Choisir</option>
                {["À temps plein", "À temps partiel", "Les week-ends", "En soirée", "Ponctuellement (missions courtes)"].map((a) => <option key={a}>{a}</option>)}
              </Select>
              <div className="sm:col-span-2"><FieldWithMic label="Présentation" rows={3} placeholder="Quelques phrases sur vous et ce que vous aimez faire." value={form.bio} onChange={(v) => set("bio", v)} /></div>
              <div className="sm:col-span-2"><FieldWithMic label="Expériences, même informelles" rows={3} placeholder="Aide au commerce familial, garde d'enfants, association…" value={form.experiences} onChange={(v) => set("experiences", v)} /></div>
              <div className="sm:col-span-2">
                <Input label="Centres d'intérêt" hint="Séparés par des virgules" value={interestsText} onChange={(e) => { setInterestsText(e.target.value); set("interests", e.target.value.split(",").map((s) => s.trim()).filter(Boolean)); }} />
              </div>
            </div>
          )}

          {tab === "competences" && (
            <div className="space-y-6">
              <div className="flex flex-col items-start justify-between gap-4 rounded-[22px] bg-plum-50 p-5 sm:flex-row sm:items-center">
                <p className="text-ink">Vous avez appris de nouvelles choses ? Refaites la découverte pour enrichir votre liste.</p>
                <ButtonLink href="/app/decouverte" variant="primary" className="shrink-0">Refaire la découverte</ButtonLink>
              </div>

              {form.skills.length === 0 ? (
                <Empty icon="✶" title="Aucune compétence pour l'instant" text="La découverte vous aide à les repérer en cinq questions." action={<ButtonLink href="/app/decouverte" variant="accent">Lancer la découverte</ButtonLink>} />
              ) : (
                <ul className="divide-y divide-line overflow-hidden rounded-[22px] bg-white ring-1 ring-line">
                  <AnimatePresence initial={false}>
                    {form.skills.map((s) => (
                      <motion.li key={s.name} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap items-center gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-ink">{s.name}</p>
                          <p className="text-[13px] text-muted">{s.category}</p>
                        </div>
                        <div className="flex rounded-full bg-bg p-0.5 ring-1 ring-line" role="radiogroup" aria-label={`Niveau en ${s.name}`}>
                          {LEVELS.map((l) => (
                            <button
                              key={l}
                              role="radio"
                              aria-checked={(s.level ?? "intermédiaire") === l}
                              onClick={() => setLevel(s.name, l)}
                              className={`rounded-full px-2.5 py-1 text-[12px] font-semibold capitalize transition-colors ${(s.level ?? "intermédiaire") === l ? "bg-plum text-white" : "text-muted hover:text-plum"}`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => set("skills", form.skills.filter((x) => x.name !== s.name))} aria-label={`Retirer ${s.name}`} className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-muted hover:bg-red-50 hover:text-red-700">×</button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              <div className="flex gap-2">
                <div className="flex-1"><Input aria-label="Nouvelle compétence" placeholder="Ajouter une compétence" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} /></div>
                <Button variant="secondary" onClick={addSkill} disabled={!newSkill.trim()}>Ajouter</Button>
              </div>
            </div>
          )}

          {tab === "portfolio" && <PortfolioBuilder />}
        </motion.div>
      </AnimatePresence>

      {/* Barre d'enregistrement : n'apparaît qu'en cas de modification */}
      <AnimatePresence>
        {dirty && tab !== "portfolio" && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-3 bottom-[92px] z-40 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-full bg-white py-2 pl-5 pr-2 shadow-[0_16px_40px_-12px_rgba(42,27,110,0.45)] ring-1 ring-line lg:bottom-6"
          >
            <span className="text-sm font-medium text-ink">Modifications non enregistrées</span>
            <Button variant="accent" loading={saving} onClick={save}>Enregistrer</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense>
      <ProfilInner />
    </Suspense>
  );
}
