"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { mediaUrl } from "@/lib/media";
import type { PortfolioItem, PortfolioMedia, PortfolioSectionId, PortfolioSettings, Skill } from "@/lib/types";

export type PortfolioData = {
  profile: {
    full_name: string; headline: string; city: string; bio: string; experiences: string; education?: string; certifications?: string;
    availability: string; skills: Skill[]; avatar_url?: string; settings?: PortfolioSettings; slug?: string | null;
  };
  items: PortfolioItem[];
  media: PortfolioMedia[];
};

export const SECTION_LABELS: Record<PortfolioSectionId, string> = {
  presentation: "Présentation",
  competences: "Compétences",
  parcours: "Expériences et formations",
  projets: "Projets et réalisations",
  galerie: "Galerie",
};
export const DEFAULT_SECTIONS: { id: PortfolioSectionId; visible: boolean }[] = (Object.keys(SECTION_LABELS) as PortfolioSectionId[]).map((id) => ({ id, visible: true }));

export function sectionsOf(settings?: PortfolioSettings) {
  const saved = settings?.sections ?? [];
  const known = saved.filter((s) => s.id in SECTION_LABELS);
  return [...known, ...DEFAULT_SECTIONS.filter((d) => !known.some((k) => k.id === d.id))];
}

const lines = (t?: string) => (t ?? "").split(/\n+/).map((l) => l.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean);
const SOFT = /(savoir|personnel|communication|leadership|ecoute|écoute|rigueur|equipe|équipe|organisation)/i;

/** Rendu soigné du portfolio : identique pour l'aperçu et le lien public. */
export function PortfolioView({ data }: { data: PortfolioData }) {
  const { profile: p, items, media } = data;
  const [open, setOpen] = useState<PortfolioMedia | null>(null);
  const sections = sectionsOf(p.settings).filter((s) => s.visible);
  const intro = p.settings?.intro?.trim() || p.bio;
  const technical = p.skills.filter((s) => !SOFT.test(`${s.category} ${s.name}`));
  const soft = p.skills.filter((s) => SOFT.test(`${s.category} ${s.name}`));
  const tools = [...new Set(items.flatMap((i) => i.tools ?? []))];
  const domains = [...new Set(p.skills.map((s) => s.category).filter((c) => c && c !== "Autre"))];
  const initials = p.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hasParcours = lines(p.experiences).length + lines(p.education).length + lines(p.certifications).length > 0;

  const render: Record<PortfolioSectionId, React.ReactNode> = {
    presentation: (
      <section key="presentation" className="relative overflow-hidden rounded-[32px] bg-night px-6 py-10 text-white sm:px-10 sm:py-14 print:bg-white print:text-ink">
        <div aria-hidden className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sun/30 blur-3xl print:hidden" />
        <div aria-hidden className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-coral/25 blur-3xl print:hidden" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          {p.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar_url} alt={p.full_name} className="h-28 w-28 shrink-0 rounded-[30px] object-cover ring-4 ring-white/15 sm:h-36 sm:w-36" />
          ) : (
            <span className="font-display flex h-28 w-28 shrink-0 items-center justify-center rounded-[30px] bg-white/10 text-[40px] ring-4 ring-white/15">{initials}</span>
          )}
          <div className="min-w-0">
            <h1 className="font-display text-[38px] sm:text-[56px]">{p.full_name}</h1>
            {p.headline && <p className="mt-1 text-lg text-sun sm:text-xl print:text-plum">{p.headline}</p>}
            <p className="mt-2 text-sm text-white/70 print:text-muted">{[p.city, p.availability && `Disponible ${p.availability.toLowerCase()}`].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        {intro && <p className="relative mt-8 max-w-3xl whitespace-pre-line text-[17px] leading-relaxed text-white/90 print:text-ink">{intro}</p>}
        {domains.length > 0 && (
          <div className="relative mt-6 flex flex-wrap gap-2">{domains.map((d) => <span key={d} className="rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/20 print:ring-line">{d}</span>)}</div>
        )}
      </section>
    ),
    competences: p.skills.length > 0 && (
      <Section key="competences" title="Compétences">
        <div className="grid gap-4 md:grid-cols-3">
          {[["Compétences techniques", technical], ["Compétences personnelles", soft]].map(([t, list]) => (list as Skill[]).length > 0 && (
            <div key={t as string} className="rounded-[24px] bg-white p-5 ring-1 ring-line">
              <p className="text-sm font-bold text-plum">{t as string}</p>
              <ul className="mt-3 space-y-2">
                {(list as Skill[]).map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-2 text-[15px]">
                    <span className="text-ink">{s.name}</span>
                    {s.level && <span className="text-[12px] capitalize text-muted">{s.level}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {tools.length > 0 && (
            <div className="rounded-[24px] bg-white p-5 ring-1 ring-line">
              <p className="text-sm font-bold text-plum">Outils et technologies</p>
              <div className="mt-3 flex flex-wrap gap-2">{tools.map((t) => <span key={t} className="rounded-full bg-plum-50 px-3 py-1 text-sm text-plum">{t}</span>)}</div>
            </div>
          )}
        </div>
      </Section>
    ),
    parcours: hasParcours && (
      <Section key="parcours" title="Expériences et formations">
        <div className="grid gap-4 md:grid-cols-3">
          {[["Expériences", p.experiences], ["Formations", p.education], ["Certifications", p.certifications]].map(([t, v]) => lines(v).length > 0 && (
            <div key={t} className="rounded-[24px] bg-white p-5 ring-1 ring-line">
              <p className="text-sm font-bold text-plum">{t}</p>
              <ol className="mt-3 space-y-3 border-l-2 border-plum-100 pl-4">
                {lines(v).map((l) => <li key={l} className="relative text-[15px] leading-snug text-ink"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-sun" />{l}</li>)}
              </ol>
            </div>
          ))}
        </div>
      </Section>
    ),
    projets: items.length > 0 && (
      <Section key="projets" title="Projets et réalisations">
        <div className="space-y-5">
          {items.map((i) => {
            const m = media.filter((x) => x.item_id === i.id);
            return (
              <article key={i.id} className="grid gap-5 overflow-hidden rounded-[28px] bg-white p-5 ring-1 ring-line sm:p-7 md:grid-cols-[1.1fr_1fr] print:break-inside-avoid">
                <div>
                  {i.category && <p className="text-[13px] font-semibold uppercase tracking-wide text-coral-700">{i.category}</p>}
                  <h3 className="font-display mt-1 text-[26px] text-plum">{i.title}</h3>
                  {i.description && <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">{i.description}</p>}
                  <dl className="mt-4 space-y-2 text-[15px]">
                    {i.goals && <div><dt className="inline font-semibold text-ink">Objectifs : </dt><dd className="inline text-muted">{i.goals}</dd></div>}
                    {i.role && <div><dt className="inline font-semibold text-ink">Mon rôle : </dt><dd className="inline text-muted">{i.role}</dd></div>}
                    {i.results && <div><dt className="inline font-semibold text-ink">Résultats : </dt><dd className="inline text-muted">{i.results}</dd></div>}
                  </dl>
                  {(i.tools?.length ?? 0) > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{i.tools!.map((t) => <span key={t} className="rounded-full bg-plum-50 px-2.5 py-0.5 text-[13px] text-plum">{t}</span>)}</div>}
                  {i.link && <a href={i.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex font-semibold text-plum underline-offset-4 hover:underline print:hidden">Voir la réalisation en ligne →</a>}
                </div>
                {m.length > 0 && (
                  <div className={`grid gap-2 ${m.length > 1 ? "grid-cols-2" : ""}`}>
                    {m.slice(0, 4).map((x, k) => <Thumb key={x.id} m={x} big={m.length === 1 || (m.length === 3 && k === 0)} onOpen={() => setOpen(x)} />)}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Section>
    ),
    galerie: media.length > 0 && (
      <Section key="galerie" title="Galerie">
        {Object.entries(groupBy(media, (m) => m.category || items.find((i) => i.id === m.item_id)?.title || "Autres")).map(([g, list]) => (
          <div key={g} className="mb-6">
            <p className="mb-2 text-sm font-bold text-muted">{g}</p>
            <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
              {list.map((m) => <Thumb key={m.id} m={m} caption onOpen={() => setOpen(m)} />)}
            </div>
          </div>
        ))}
      </Section>
    ),
  };

  return (
    <div className="space-y-12">
      {sections.map((s) => render[s.id])}
      <Lightbox m={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="print:break-inside-avoid">
      <h2 className="font-display mb-5 text-[28px] text-plum sm:text-[34px]">{title}</h2>
      {children}
    </section>
  );
}

function Thumb({ m, onOpen, big, caption }: { m: PortfolioMedia; onOpen: () => void; big?: boolean; caption?: boolean }) {
  const url = mediaUrl(m.path);
  return (
    <button type="button" onClick={onOpen} className={`group relative block w-full overflow-hidden rounded-2xl bg-plum-50 text-left ${big ? "col-span-2" : ""}`} aria-label={`Ouvrir ${m.title || "le média"}`}>
      {m.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={m.caption || m.title} loading="lazy" decoding="async" className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${caption ? "" : "aspect-[4/3] h-full"}`} />
      ) : (
        <span className="relative block">
          <video src={`${url}#t=0.5`} preload="metadata" muted playsInline className={`w-full object-cover ${caption ? "" : "aspect-[4/3]"}`} />
          <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-plum shadow-lg">▶</span></span>
        </span>
      )}
      {caption && (m.title || m.caption) && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent p-3 pt-8 text-[13px] text-white">
          <span className="block font-semibold">{m.title}</span>
          {m.caption && <span className="line-clamp-2 text-white/80">{m.caption}</span>}
        </span>
      )}
    </button>
  );
}

function Lightbox({ m, onClose }: { m: PortfolioMedia | null; onClose: () => void }) {
  useEffect(() => {
    if (!m) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [m, onClose]);
  return (
    <AnimatePresence>
      {m && (
        <motion.div role="dialog" aria-modal="true" aria-label={m.title} className="fixed inset-0 z-[60] flex items-center justify-center bg-night/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <button onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25">×</button>
          <motion.figure initial={{ scale: 0.96 }} animate={{ scale: 1 }} className="max-h-full w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {m.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(m.path)} alt={m.caption || m.title} className="mx-auto max-h-[75vh] rounded-2xl object-contain" />
            ) : (
              <video src={mediaUrl(m.path)} controls autoPlay playsInline className="mx-auto max-h-[75vh] rounded-2xl" />
            )}
            {(m.title || m.description || m.caption) && (
              <figcaption className="mx-auto mt-4 max-w-2xl text-center text-white">
                {m.title && <p className="font-semibold">{m.title}</p>}
                <p className="mt-1 text-sm text-white/75">{m.description || m.caption}</p>
                {m.keywords?.length > 0 && <p className="mt-2 text-[13px] text-sun">{m.keywords.map((k) => `#${k}`).join("  ")}</p>}
              </figcaption>
            )}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function groupBy<T>(a: T[], f: (x: T) => string) {
  return a.reduce<Record<string, T[]>>((acc, x) => { (acc[f(x)] ??= []).push(x); return acc; }, {});
}
