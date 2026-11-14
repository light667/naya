"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Button, Input, Textarea } from "@/components/ui";
import { VoiceButton, appendText } from "@/components/VoiceInput";
import { supabase } from "@/lib/supabase";
import { callAi } from "@/lib/ai-client";
import { optimizeImage, uploadFile, mediaUrl, checkFile } from "@/lib/media";
import type { Profile, Skill } from "@/lib/types";

type Proposal = {
  headline?: string; bio?: string; experiences?: string; education?: string; certifications?: string;
  skills?: { name: string; category: string; kind?: string }[]; questions?: string[];
};
type Fields = Pick<Profile, "headline" | "bio" | "experiences"> & { education: string; certifications: string; avatar_url: string };

/** Étape 1 : présentation écrite ou dictée, organisée par l'IA puis validée par l'utilisatrice. */
export function StepPresentation({ onNext }: { onNext: () => void }) {
  const { profile, setProfile } = useAuth();
  const toast = useToast();
  const [f, setF] = useState<Fields>({
    headline: profile?.headline ?? "", bio: profile?.bio ?? "", experiences: profile?.experiences ?? "",
    education: profile?.education ?? "", certifications: profile?.certifications ?? "", avatar_url: profile?.avatar_url ?? "",
  });
  const [raw, setRaw] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [keepSkills, setKeepSkills] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!profile) return null;
  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => { setF((x) => ({ ...x, [k]: v })); setDirty(true); };

  async function organize() {
    setBusy(true);
    try {
      const r = await callAi<Proposal>({ kind: "portfolio_profile", text: raw });
      setProposal(r);
      setKeepSkills(Object.fromEntries((r.skills ?? []).filter((s) => !profile!.skills.some((k) => k.name.toLowerCase() === s.name.toLowerCase())).map((s) => [s.name, true])));
    } catch (e) {
      toast((e as Error).message, "error");
    }
    setBusy(false);
  }

  function apply(k: keyof Proposal) {
    const v = proposal?.[k];
    if (typeof v === "string" && v.trim()) set(k as keyof Fields, v.trim());
  }

  async function save(extraSkills: Skill[] = []) {
    setSaving(true);
    const skills = [...profile!.skills, ...extraSkills];
    const { data, error } = await supabase.from("profiles").update({ ...f, skills }).eq("id", profile!.id).select().single();
    setSaving(false);
    if (error) return toast(error.message.includes("column") ? "Exécutez la migration 002 dans Supabase pour activer le portfolio." : error.message, "error");
    setProfile(data as Profile);
    setDirty(false);
    toast("Présentation enregistrée");
    return true;
  }

  async function applyAll() {
    if (!proposal) return;
    const next = { ...f };
    (["headline", "bio", "experiences", "education", "certifications"] as const).forEach((k) => { const v = proposal[k]; if (typeof v === "string" && v.trim()) next[k] = v.trim(); });
    setF(next);
    const extra = (proposal.skills ?? []).filter((s) => keepSkills[s.name]).map((s) => ({ name: s.name, category: s.category || "Autre", level: "intermédiaire" as const }));
    setProposal(null);
    const { data, error } = await supabase.from("profiles").update({ ...next, skills: [...profile!.skills, ...extra] }).eq("id", profile!.id).select().single();
    if (error) return toast(error.message, "error");
    setProfile(data as Profile);
    setDirty(false);
    toast("Propositions appliquées et enregistrées");
  }

  async function uploadAvatar(file: File) {
    const c = checkFile(file);
    if ("error" in c || c.kind !== "image") return toast("error" in c ? c.error : "Choisissez une photo.", "error");
    setUploading(true);
    try {
      const path = await uploadFile(profile!.id, await optimizeImage(file), file.name);
      set("avatar_url", mediaUrl(path));
    } catch (e) {
      toast((e as Error).message, "error");
    }
    setUploading(false);
  }

  return (
    <div className="space-y-6">
      {/* Saisie libre, écrite ou vocale */}
      <section className="rounded-[24px] bg-night p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-sun">Parlez de vous, l&apos;IA s&apos;occupe de la mise en forme</p>
        <h3 className="font-display mt-1 text-[26px] sm:text-[30px]">Racontez votre parcours comme à une amie</h3>
        <p className="mt-2 max-w-2xl text-white/75">Ce que vous savez faire, vos expériences même informelles, vos études, ce dont vous êtes fière. Appuyez sur le micro et parlez, ou écrivez.</p>
        <div className="mt-5 rounded-2xl bg-white p-3">
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={5}
            placeholder="Ex. : J'ai eu mon BEPC en 2019. Depuis 3 ans je couds des tenues en pagne pour les femmes de mon quartier, environ 10 par mois…"
            className="w-full resize-y rounded-xl bg-white p-2 text-[15px] leading-relaxed text-ink placeholder:text-neutral-400 focus:outline-none"
            aria-label="Votre parcours, en quelques phrases"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
            <VoiceButton onText={(t) => setRaw((r) => appendText(r, t))} label="Parler" />
            <Button variant="accent" loading={busy} disabled={raw.trim().length < 20} onClick={organize}>Organiser avec l&apos;IA</Button>
          </div>
        </div>
      </section>

      {proposal && (
        <section className="rounded-[24px] bg-white p-5 ring-2 ring-sun sm:p-6" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-[22px] text-plum">Proposition de l&apos;IA</h3>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setProposal(null)}>Refuser</Button>
              <Button variant="primary" onClick={applyAll}>Tout appliquer</Button>
            </div>
          </div>
          <p className="text-sm text-muted">Basée uniquement sur ce que vous avez dit. Appliquez ce qui vous convient, puis modifiez librement.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(["headline", "bio", "experiences", "education", "certifications"] as const).map((k) => proposal[k]?.trim() ? (
              <div key={k} className="rounded-2xl bg-bg p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold uppercase tracking-wide text-muted">{{ headline: "Titre", bio: "Présentation", experiences: "Expériences", education: "Formations", certifications: "Certifications" }[k]}</p>
                  <button onClick={() => apply(k)} className="text-sm font-semibold text-plum hover:underline">Appliquer</button>
                </div>
                <p className="mt-1 whitespace-pre-line text-[15px] text-ink">{proposal[k]}</p>
              </div>
            ) : null)}
          </div>
          {Object.keys(keepSkills).length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-ink">Nouvelles compétences repérées</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.keys(keepSkills).map((n) => (
                  <label key={n} className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${keepSkills[n] ? "bg-plum text-white ring-plum" : "bg-white text-muted ring-line"}`}>
                    <input type="checkbox" className="sr-only" checked={keepSkills[n]} onChange={(e) => setKeepSkills((s) => ({ ...s, [n]: e.target.checked }))} />
                    {keepSkills[n] ? "✓ " : "+ "}{n}
                  </label>
                ))}
              </div>
            </div>
          )}
          {(proposal.questions?.length ?? 0) > 0 && (
            <div className="mt-4 rounded-2xl bg-sun-50 p-4 text-sm text-sun-900">
              <p className="font-semibold">Pour compléter, l&apos;IA a besoin de précisions :</p>
              <ul className="mt-1 space-y-0.5">{proposal.questions!.map((q) => <li key={q}>• {q}</li>)}</ul>
              <p className="mt-2">Répondez dans le champ ci-dessus puis relancez « Organiser avec l&apos;IA ».</p>
            </div>
          )}
        </section>
      )}

      {/* Champs validés */}
      <section className="grid gap-4 rounded-[24px] bg-white p-5 ring-1 ring-line sm:grid-cols-[auto_1fr] sm:p-6">
        <div className="flex flex-col items-center gap-2">
          <label className="group relative cursor-pointer">
            {f.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.avatar_url} alt="Photo de profil" className="h-28 w-28 rounded-[28px] object-cover ring-1 ring-line" />
            ) : (
              <span className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-plum-50 text-center text-[13px] font-semibold text-plum">Ajouter une photo</span>
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
            {uploading && <span className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/70 text-sm">Envoi…</span>}
          </label>
          <span className="text-[12px] text-muted">Photo de profil</span>
        </div>
        <div className="space-y-4">
          <Input label="Titre professionnel" placeholder="Couturière et créatrice en pagne" value={f.headline} onChange={(e) => set("headline", e.target.value)} />
          <FieldWithMic label="Présentation" value={f.bio} onChange={(v) => set("bio", v)} rows={4} placeholder="Quelques phrases sur vous et ce que vous aimez faire." />
        </div>
        <div className="space-y-4 sm:col-span-2">
          <FieldWithMic label="Expériences, même informelles" value={f.experiences} onChange={(v) => set("experiences", v)} rows={4} placeholder="• Aide au commerce familial depuis 2020…" />
          <div className="grid gap-4 md:grid-cols-2">
            <FieldWithMic label="Formations et diplômes" value={f.education} onChange={(v) => set("education", v)} rows={3} placeholder="• BEPC (2019)…" />
            <FieldWithMic label="Certifications et formations complémentaires" value={f.certifications} onChange={(v) => set("certifications", v)} rows={3} placeholder="• Formation Canva, Togo Digital Hub (2024)" />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" loading={saving} disabled={!dirty} onClick={() => save()}>Enregistrer</Button>
        <Button variant="primary" onClick={async () => { if (!dirty || (await save())) onNext(); }}>Étape suivante : médias →</Button>
      </div>
    </div>
  );
}

export function FieldWithMic({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <VoiceButton onText={(t) => onChange(appendText(value, t))} />
      </div>
      <Textarea aria-label={label} rows={rows} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="resize-y" />
    </div>
  );
}
