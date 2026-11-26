"use client";

import { useState } from "react";
import { CATEGORY_IDS, iconFor, LEVEL_LABEL, LEVELS, normalizeCategory, STATUS_LABEL, type IconId } from "@/lib/skills";
import type { Skill, SkillLevel } from "@/lib/types";

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Pictogrammes de métier : reconnaissables sans lire. */
const PATHS: Record<IconId, React.ReactNode> = {
  needle: (<><path d="M5 19 18 6" /><path d="M16.5 4.5a2.1 2.1 0 0 1 3 3" /><path d="M8 16c-3 0-4 2-3 4 2 1 4 0 4-3" /></>),
  basket: (<><path d="M4 10h16l-1.6 9a1.5 1.5 0 0 1-1.5 1.2H7.1A1.5 1.5 0 0 1 5.6 19z" /><path d="M8 10 11 4M16 10l-3-6M9 14v3M12 14v3M15 14v3" /></>),
  hammer: (<><path d="m14 7 3 3-9 9a2.1 2.1 0 0 1-3-3z" /><path d="M12.5 5.5 15 3l6 6-2.5 2.5" /></>),
  phone: (<><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 17.5h2" /></>),
  sprout: (<><path d="M12 21v-9" /><path d="M12 12c0-4 3-7 8-7 0 4-3 7-8 7zM12 14c0-3-2.5-5.5-7-5.5 0 3 2.5 5.5 7 5.5z" /></>),
  pot: (<><path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" /><path d="M2 10h20M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2" /></>),
  calculator: (<><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M8.5 7h7M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" /></>),
  book: (<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />),
  comb: (<><path d="M4 8h16v3H4z" /><path d="M6 11v6M9 11v7M12 11v6M15 11v7M18 11v6" /></>),
  heart: (<path d="M12 20s-7.5-4.5-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10C19.5 15.5 12 20 12 20z" />),
};

export function SkillIcon({ category, className = "h-5 w-5" }: { category: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...P} aria-hidden>
      {PATHS[iconFor(category)]}
    </svg>
  );
}

/** Affichage identique partout. En mode `editable`, chaque ligne se renomme, change de niveau ou se supprime. */
export function SkillList({
  skills,
  editable,
  onChange,
  compact,
}: {
  skills: Skill[];
  editable?: boolean;
  onChange?: (next: Skill[]) => void;
  compact?: boolean;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<string>(CATEGORY_IDS[0]);

  const update = (i: number, patch: Partial<Skill>) => onChange?.(skills.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => onChange?.(skills.filter((_, j) => j !== i));

  function add(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    onChange?.([...skills, { name, category: newCat, level: "intermédiaire", source: "manuel", status: "declaree", added_at: new Date().toISOString() }]);
    setNewName("");
    setAdding(false);
  }

  if (compact) {
    return (
      <ul className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <li key={s.name} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm text-ink ring-1 ring-line">
            <SkillIcon category={s.category} className="h-4 w-4 text-muted" />
            {s.name}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
        {skills.map((s, i) => (
          <li key={`${s.name}-${i}`} className="flex gap-3 px-4 py-3 sm:px-5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-ink" title={normalizeCategory(s.category)}>
              <SkillIcon category={s.category} />
            </span>
            <div className="min-w-0 flex-1">
              {editable && editing === i ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (draft.trim()) update(i, { name: draft.trim() });
                    setEditing(null);
                  }}
                  className="flex gap-2"
                >
                  <label className="sr-only" htmlFor={`skill-${i}`}>Nouveau nom</label>
                  <input id={`skill-${i}`} autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-11 min-w-0 flex-1 rounded-lg border border-line px-3 text-sm focus:border-sun focus:outline-none" />
                  <button className="min-h-11 rounded-lg bg-ink px-3 text-sm font-medium text-white">OK</button>
                </form>
              ) : (
                <p className="text-base font-medium text-ink">{s.name}</p>
              )}
              <p className="mt-0.5 text-xs text-muted">
                {LEVEL_LABEL[s.level ?? "intermédiaire"]} · {STATUS_LABEL[s.status ?? "declaree"]}
              </p>
              {s.evidence && <p className="mt-1 text-sm text-slate-600">« {s.evidence} »</p>}
              {editable && editing !== i && (
                <div className="mt-2 flex flex-wrap items-center gap-x-1">
                  <label className="sr-only" htmlFor={`level-${i}`}>Niveau</label>
                  <select
                    id={`level-${i}`}
                    value={s.level ?? "intermédiaire"}
                    onChange={(e) => update(i, { level: e.target.value as SkillLevel })}
                    className="min-h-11 rounded-lg border border-line bg-white px-2 text-sm text-ink focus:border-sun focus:outline-none"
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>{LEVEL_LABEL[l]}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => { setEditing(i); setDraft(s.name); }} className="min-h-11 px-2 text-sm text-muted underline underline-offset-4 hover:text-ink">
                    Renommer
                  </button>
                  <button type="button" onClick={() => remove(i)} className="min-h-11 px-2 text-sm text-muted underline underline-offset-4 hover:text-red-700">
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {editable &&
        (adding ? (
          <form onSubmit={add} className="mt-3 grid gap-2 sm:grid-cols-[1fr_200px_auto]">
            <label className="sr-only" htmlFor="new-skill">Compétence</label>
            <input id="new-skill" autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex. Coupe de tissu wax" className="min-h-12 rounded-xl border border-line bg-white px-4 text-sm focus:border-sun focus:outline-none" />
            <label className="sr-only" htmlFor="new-cat">Métier</label>
            <select id="new-cat" value={newCat} onChange={(e) => setNewCat(e.target.value)} className="min-h-12 rounded-xl border border-line bg-white px-3 text-sm focus:border-sun focus:outline-none">
              {CATEGORY_IDS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button className="min-h-12 rounded-xl bg-ink px-5 text-sm font-semibold text-white">Ajouter</button>
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4">
            Ajouter une compétence moi-même
          </button>
        ))}
    </div>
  );
}
