"use client";

import { motion } from "motion/react";
import { ScoreRing } from "@/components/ui";
import type { Compatibility } from "@/lib/types";

/** Analyse de compatibilité : score pondéré, critères, compétences, points forts et à renforcer. */
export function CompatPanel({
  analysis,
  answers,
  onAnswer,
  onAddSkill,
}: {
  analysis: Compatibility;
  answers: Record<string, string>;
  onAnswer: (id: string, v: string) => void;
  onAddSkill?: (name: string) => void;
}) {
  const a = analysis;
  return (
    <section aria-labelledby="compat-title" className="rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
      <div className="flex items-center gap-4">
        {a.complete && a.score !== null ? (
          <ScoreRing value={a.score} size={72} />
        ) : (
          <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-sun-50 text-2xl font-bold text-sun-800 ring-4 ring-sun-100" aria-hidden>?</span>
        )}
        <div className="min-w-0">
          <h3 id="compat-title" className="font-display text-[22px] text-plum">
            {a.complete && a.score !== null ? `Compatibilité avec la mission : ${a.score} %` : "Analyse incomplète"}
          </h3>
          <p className="text-sm text-muted">
            {a.complete ? "Calculée à partir de critères pondérés, détaillés ci-dessous." : "Il manque des informations pour calculer un score fiable. Répondez aux questions ci-dessous ou complétez votre profil."}
          </p>
        </div>
      </div>

      {a.missingData.length > 0 && (
        <ul className="mt-4 space-y-1 rounded-2xl bg-sun-50 p-3 text-sm text-sun-900">
          {a.missingData.map((m) => <li key={m}>• {m}</li>)}
        </ul>
      )}

      {/* Critères pondérés */}
      <ul className="mt-5 space-y-3">
        {a.criteria.map((c, i) => (
          <li key={c.id}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-semibold text-ink">{c.label} <span className="font-normal text-muted">· {c.weight} pts</span></span>
              <span className="tabular-nums text-muted">{Math.round(c.earned)} / {c.weight}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-plum-50">
              <motion.div
                className={`h-full rounded-full ${c.earned / c.weight >= 0.7 ? "bg-sage" : c.earned / c.weight >= 0.35 ? "bg-plum" : "bg-sun"}`}
                initial={{ width: 0 }}
                animate={{ width: `${(c.earned / c.weight) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-0.5 text-xs text-muted">{c.detail}</p>
          </li>
        ))}
      </ul>

      {/* Compétences */}
      {(a.matchedSkills.length > 0 || a.partialSkills.length > 0 || a.missingSkills.length > 0) && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-ink">Compétences demandées</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {a.matchedSkills.map((m) => (
              <li key={m.skill} title={m.via} className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 text-xs font-medium text-sage-700">✓ {m.skill}</li>
            ))}
            {a.partialSkills.map((m) => (
              <li key={m.skill} title={m.via} className="inline-flex items-center gap-1.5 rounded-full bg-sun-50 px-3 py-1 text-xs font-medium text-sun-900">≈ {m.skill}</li>
            ))}
            {a.missingSkills.map((s) => (
              <li key={s} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">○ {s}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">✓ dans votre profil · ≈ évoquée dans votre parcours · ○ absente</p>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {a.strengths.length > 0 && (
          <div className="rounded-2xl bg-sage-50/70 p-4">
            <p className="text-sm font-bold text-sage-700">Points forts</p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink">{a.strengths.map((s) => <li key={s}>• {s}</li>)}</ul>
          </div>
        )}
        {a.gaps.length > 0 && (
          <div className="rounded-2xl bg-sun-50/70 p-4">
            <p className="text-sm font-bold text-sun-900">Points à renforcer</p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink">{a.gaps.map((s) => <li key={s}>• {s}</li>)}</ul>
          </div>
        )}
      </div>

      {a.tips.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-bold text-plum">Conseils</p>
          <ul className="mt-2 space-y-2 text-sm text-ink">
            {a.tips.map((t) => <li key={t} className="rounded-xl bg-plum-50/60 px-3 py-2">{t}</li>)}
          </ul>
          {onAddSkill && a.partialSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {a.partialSkills.map((p) => (
                <button key={p.skill} type="button" onClick={() => onAddSkill(p.skill)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-plum ring-1 ring-plum/25 hover:bg-plum-50">
                  + Ajouter « {p.skill} » à mes compétences
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {a.questions.length > 0 && (
        <div className="mt-5 border-t border-line pt-5">
          <p className="text-sm font-bold text-ink">Pour une candidature plus juste, répondez si vous le pouvez</p>
          <p className="text-xs text-muted">Vos réponses sont utilisées telles quelles, l&apos;assistante n&apos;invente rien.</p>
          <div className="mt-3 space-y-3">
            {a.questions.map((q) => (
              <label key={q.id} className="block">
                <span className="text-sm text-ink">{q.question}</span>
                <input
                  value={answers[q.id] ?? ""}
                  onChange={(e) => onAnswer(q.id, e.target.value)}
                  placeholder="Facultatif"
                  className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-[15px] focus:border-plum focus:outline-none focus:ring-4 focus:ring-plum/10"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
