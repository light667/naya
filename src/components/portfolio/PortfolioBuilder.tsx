"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { PortfolioItem, PortfolioMedia } from "@/lib/types";
import { StepPresentation } from "./StepPresentation";
import { StepMedia } from "./StepMedia";
import { StepAi } from "./StepAi";
import { StepPreview, StepPublish } from "./StepPublish";

const STEPS = ["Présentation", "Médias et projets", "Descriptions IA", "Aperçu", "Publication"];

/** Création du portfolio en étapes simples : écrire ou dicter → importer → l'IA décrit → relire → publier. */
export function PortfolioBuilder() {
  const { profile } = useAuth();
  const [step, setStep] = useState(0);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [media, setMedia] = useState<PortfolioMedia[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      supabase.from("portfolio_items").select("*").eq("user_id", profile.id).order("position").order("created_at", { ascending: false }),
      supabase.from("portfolio_media").select("*").eq("user_id", profile.id).order("position").order("created_at"),
    ]).then(([i, m]) => {
      setItems((i.data as PortfolioItem[]) ?? []);
      setMedia((m.data as PortfolioMedia[]) ?? []);
      setMediaError(!!m.error);
      setLoaded(true);
    });
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (n: number) => { setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  if (!loaded) return <div className="h-60 animate-pulse rounded-[22px] bg-white ring-1 ring-line" />;

  return (
    <div>
      {mediaError && (
        <p className="mb-4 rounded-2xl bg-sun-50 p-4 text-sm text-sun-900">
          Les médias et le lien public nécessitent la migration <code>002_assistant_portfolio.sql</code> dans Supabase (SQL Editor).
        </p>
      )}
      <ol className="no-scrollbar -mx-1 mb-6 flex gap-1 overflow-x-auto px-1" aria-label="Étapes du portfolio">
        {STEPS.map((s, i) => (
          <li key={s} className="shrink-0">
            <button
              onClick={() => go(i)}
              aria-current={step === i ? "step" : undefined}
              className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold transition-colors ${step === i ? "bg-plum text-white" : i < step ? "bg-white text-plum ring-1 ring-plum/20" : "bg-white text-muted ring-1 ring-line"}`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${step === i ? "bg-sun text-night" : i < step ? "bg-sage text-white" : "bg-bg"}`}>{i < step ? "✓" : i + 1}</span>
              {s}
            </button>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {step === 0 && <StepPresentation onNext={() => go(1)} />}
          {step === 1 && <StepMedia items={items} setItems={setItems} media={media} setMedia={setMedia} onNext={() => go(2)} onBack={() => go(0)} />}
          {step === 2 && <StepAi media={media} setMedia={setMedia} onNext={() => go(3)} onBack={() => go(1)} />}
          {step === 3 && <StepPreview items={items} media={media} onNext={() => go(4)} onBack={() => go(2)} />}
          {step === 4 && <StepPublish onBack={() => go(3)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
