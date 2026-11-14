"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { ScoreRing, VerifiedBadge } from "./ui";

const ANSWER = "J'aide ma mère au marché de Bè et je gère la page Facebook de sa boutique.";
const SKILLS = ["Vente", "Relation client", "Réseaux sociaux", "Gestion de caisse", "Négociation"];

/** La séquence signature : une phrase du quotidien → des compétences → une mission vérifiée. */
export function HeroDemo() {
  const reduce = useReducedMotion();
  const [typed, setTyped] = useState(reduce ? ANSWER.length : 0);
  const [phase, setPhase] = useState(reduce ? 3 : 0);

  useEffect(() => {
    if (reduce) return;
    const start = setTimeout(() => setPhase(1), 500);
    return () => clearTimeout(start);
  }, [reduce]);

  useEffect(() => {
    if (phase !== 1) return;
    if (typed >= ANSWER.length) {
      const t = setTimeout(() => setPhase(2), 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTyped((n) => n + 1), 28);
    return () => clearTimeout(t);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== 2) return;
    const t = setTimeout(() => setPhase(3), SKILLS.length * 180 + 450);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="relative w-full max-w-[340px]">
      <div className="relative rounded-[26px] bg-white text-ink shadow-[0_40px_80px_-30px_rgba(10,4,40,0.8)] ring-1 ring-white/20">
        <div className="px-4 pb-4 pt-4">
          <div className="flex items-center justify-between text-[13px] text-muted">
            <span className="font-semibold text-plum">Découverte</span>
            <span>Question 1 sur 5</span>
          </div>
          <p className="font-display mt-3 text-[19px] text-plum">Que faites-vous pour aider votre entourage&nbsp;?</p>

          <div className="mt-3 min-h-[70px] rounded-2xl bg-bg p-3 text-[14px] leading-relaxed text-ink ring-1 ring-line">
            {ANSWER.slice(0, typed)}
            {phase === 1 && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-plum" />}
          </div>

          <div className="mt-3 min-h-[76px]">
            {phase >= 2 && <p className="mb-2 text-[13px] text-muted">Compétences repérées</p>}
            <div className="flex flex-wrap gap-2">
              {phase >= 2 &&
                SKILLS.map((s, i) => (
                  <motion.span
                    key={s}
                    initial={reduce ? false : { opacity: 0, scale: 0.4, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 22, delay: i * 0.18 }}
                    className="rounded-full bg-plum px-2.5 py-1 text-[12px] font-medium text-white"
                  >
                    {s}
                  </motion.span>
                ))}
            </div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-line"
          >
            <div className="flex items-center gap-3">
              {phase >= 3 && <ScoreRing value={92} size={48} />}
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">Assistante réseaux sociaux</p>
                <p className="truncate text-[13px] text-muted">Boutique Ama Pagnes, Lomé</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <VerifiedBadge />
              <span className="text-[13px] font-semibold text-plum">35 000 FCFA / mois</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
