"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Button, Input, Textarea } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/media";
import type { PortfolioItem, PortfolioMedia, PortfolioSectionId, Profile } from "@/lib/types";
import { PortfolioView, SECTION_LABELS, sectionsOf } from "./PortfolioView";

/** Étape 5 : aperçu fidèle + organisation des sections (visibilité, ordre). */
export function StepPreview({ items, media, onNext, onBack }: { items: PortfolioItem[]; media: PortfolioMedia[]; onNext: () => void; onBack: () => void }) {
  const { profile, setProfile } = useAuth();
  const toast = useToast();
  const [sections, setSections] = useState(sectionsOf(profile?.portfolio_settings));
  const [intro, setIntro] = useState(profile?.portfolio_settings?.intro ?? "");
  const [saving, setSaving] = useState(false);
  if (!profile) return null;

  const move = (i: number, d: -1 | 1) => setSections((s) => { const n = [...s]; const j = i + d; if (j < 0 || j >= n.length) return s; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const toggle = (id: PortfolioSectionId) => setSections((s) => s.map((x) => (x.id === id ? { ...x, visible: !x.visible } : x)));

  async function save(next?: () => void) {
    setSaving(true);
    const portfolio_settings = { ...(profile!.portfolio_settings ?? {}), sections, intro };
    const { data, error } = await supabase.from("profiles").update({ portfolio_settings }).eq("id", profile!.id).select().single();
    setSaving(false);
    if (error) return toast(error.message, "error");
    setProfile(data as Profile);
    toast("Organisation enregistrée");
    next?.();
  }

  const data = { profile: { ...profile, settings: { sections, intro } }, items, media };

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] bg-white p-5 ring-1 ring-line sm:p-6">
        <h3 className="font-display text-[22px] text-plum">Ce que les visiteurs verront</h3>
        <p className="text-sm text-muted">Masquez une section ou changez l&apos;ordre. Rien n&apos;est publié tant que vous n&apos;activez pas le partage.</p>
        <ul className="mt-4 space-y-2">
          {sections.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2 rounded-2xl bg-bg px-3 py-2">
              <label className="flex flex-1 cursor-pointer items-center gap-3">
                <input type="checkbox" checked={s.visible} onChange={() => toggle(s.id)} className="h-5 w-5 accent-[var(--color-plum)]" />
                <span className={`font-semibold ${s.visible ? "text-ink" : "text-muted line-through"}`}>{SECTION_LABELS[s.id]}</span>
              </label>
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Monter ${SECTION_LABELS[s.id]}`} className="rounded-full px-2 py-1 text-plum disabled:opacity-30">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} aria-label={`Descendre ${SECTION_LABELS[s.id]}`} className="rounded-full px-2 py-1 text-plum disabled:opacity-30">↓</button>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Textarea label="Texte d'accueil du portfolio (facultatif)" hint="Sinon, votre présentation est utilisée." rows={2} value={intro} onChange={(e) => setIntro(e.target.value)} />
        </div>
      </section>

      <div className="rounded-[32px] bg-bg p-3 ring-1 ring-line sm:p-6">
        <p className="mb-4 text-center text-[13px] font-semibold uppercase tracking-wide text-muted">Aperçu</p>
        <PortfolioView data={data} />
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="ghost" onClick={onBack}>← Descriptions</Button>
        <Button variant="primary" loading={saving} onClick={() => save(onNext)}>Étape suivante : publier →</Button>
      </div>
    </div>
  );
}

/** Étape 6 : lien unique et permanent, partage, version publique ou privée, PDF. */
export function StepPublish({ onBack }: { onBack: () => void }) {
  const { profile, setProfile } = useAuth();
  const toast = useToast();
  const [slug, setSlug] = useState(profile?.portfolio_slug ?? "");
  const [busy, setBusy] = useState(false);
  if (!profile) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = profile.portfolio_slug ? `${origin}/p/${profile.portfolio_slug}` : "";
  const shareText = `Découvrez mon portfolio professionnel : ${url}`;

  async function update(patch: Partial<Profile>, msg: string) {
    setBusy(true);
    const { data, error } = await supabase.from("profiles").update(patch).eq("id", profile!.id).select().single();
    setBusy(false);
    if (error) {
      if (error.code === "23505") return toast("Cette adresse est déjà prise, choisissez-en une autre.", "error");
      return toast(error.message.includes("column") ? "Exécutez la migration 002 dans Supabase." : error.message, "error");
    }
    setProfile(data as Profile);
    toast(msg);
  }

  async function createLink() {
    const base = slugify(profile!.full_name || "portfolio");
    for (let i = 0; i < 4; i++) {
      const candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      const { data, error } = await supabase.from("profiles").update({ portfolio_slug: candidate }).eq("id", profile!.id).select().single();
      if (!error) { setProfile(data as Profile); setSlug(candidate); toast("Votre lien est créé"); return; }
      if (error.code !== "23505") return toast(error.message.includes("column") ? "Exécutez la migration 002 dans Supabase." : error.message, "error");
    }
  }

  return (
    <div className="space-y-6">
      {!profile.portfolio_slug ? (
        <section className="rounded-[24px] bg-night p-6 text-white sm:p-8">
          <h3 className="font-display text-[28px]">Obtenez votre lien de portfolio</h3>
          <p className="mt-2 max-w-xl text-white/75">Une adresse unique et permanente, à envoyer aux recruteurs et clients. Ils n&apos;ont pas besoin de compte pour la consulter.</p>
          <Button variant="accent" className="mt-5" onClick={createLink}>Créer mon lien</Button>
        </section>
      ) : (
        <>
          <section className="rounded-[24px] bg-white p-5 ring-1 ring-line sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted">Votre lien</p>
                <p className="break-all font-display text-[20px] text-plum">{url}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${profile.portfolio_public ? "bg-sage-50 text-sage-700" : "bg-neutral-100 text-neutral-700"}`}>
                {profile.portfolio_public ? "● Public" : "○ Privé"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={async () => { await navigator.clipboard.writeText(url); toast("Lien copié"); }}>Copier le lien</Button>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full bg-[#25D366] px-5 py-3 text-[15px] font-semibold text-[#0b3d1f] hover:brightness-95">WhatsApp</a>
              <a href={`mailto:?subject=${encodeURIComponent(`Portfolio de ${profile.full_name}`)}&body=${encodeURIComponent(shareText)}`} className="inline-flex items-center rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-plum ring-1 ring-plum/25 hover:bg-plum-50">E-mail</a>
              {typeof navigator !== "undefined" && "share" in navigator && (
                <Button variant="secondary" onClick={() => navigator.share({ title: `Portfolio de ${profile.full_name}`, url }).catch(() => {})}>Autres applications…</Button>
              )}
              <a href={`/p/${profile.portfolio_slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full px-4 py-3 text-[15px] font-semibold text-plum hover:bg-plum-50">Ouvrir ↗</a>
              <a href={`/p/${profile.portfolio_slug}?print=1`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full px-4 py-3 text-[15px] font-semibold text-plum hover:bg-plum-50">Télécharger en PDF</a>
            </div>
          </section>

          <section className="rounded-[24px] bg-white p-5 ring-1 ring-line sm:p-6">
            <label className="flex cursor-pointer items-start gap-4">
              <input type="checkbox" className="mt-1 h-6 w-6 accent-[var(--color-sage)]" checked={!!profile.portfolio_public} disabled={busy}
                onChange={(e) => update({ portfolio_public: e.target.checked }, e.target.checked ? "Portfolio publié : le lien est actif" : "Partage désactivé : le lien n'est plus accessible")} />
              <span>
                <span className="block font-semibold text-ink">Partage public activé</span>
                <span className="text-sm text-muted">Désactivez-le à tout moment : le lien reste le même et redevient actif quand vous le réactivez. En privé, vous seule voyez la page.</span>
              </span>
            </label>
          </section>

          <section className="rounded-[24px] bg-white p-5 ring-1 ring-line sm:p-6">
            <p className="font-semibold text-ink">Personnaliser l&apos;adresse</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1"><Input aria-label="Adresse du portfolio" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} /></div>
              <Button variant="secondary" loading={busy} disabled={!slug || slug === profile.portfolio_slug || slug.length < 3} onClick={() => update({ portfolio_slug: slug }, "Adresse mise à jour")}>Changer</Button>
            </div>
            <p className="mt-1 text-[13px] text-muted">Attention : l&apos;ancien lien cessera de fonctionner. Les modifications du contenu, elles, ne changent jamais le lien.</p>
          </section>
        </>
      )}
      <div><Button variant="ghost" onClick={onBack}>← Aperçu</Button></div>
    </div>
  );
}
