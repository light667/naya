"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { AiBadge, Button, Chip, Logo, Textarea } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { callAi } from "@/lib/ai-client";
import type { Profile, Skill, Suggestion } from "@/lib/types";

const QUESTIONS = [
  {
    q: "Que faites-vous pour aider votre famille ou votre entourage ?",
    quick: ["Je garde des enfants", "Je fais la cuisine", "J'aide au commerce familial", "Je fais le ménage", "Je m'occupe des courses et du budget"],
  },
  {
    q: "Qu'est-ce qu'on vous demande souvent parce que vous le faites bien ?",
    quick: ["Coiffer, tresser", "Coudre ou retoucher", "Organiser une fête", "Expliquer les devoirs", "Faire de jolies photos", "Écrire des messages"],
  },
  {
    q: "Avez-vous déjà gagné un peu d'argent ? Comment ?",
    quick: ["Vente de produits", "Tresses le week-end", "Cours à des enfants", "Pâtisseries sur commande", "Tontine", "Pas encore"],
  },
  {
    q: "Quelles études, formations ou activités avez-vous suivies ?",
    quick: ["BAC", "Formation professionnelle", "Association ou ONG", "Chorale ou église", "Sport", "Déléguée de classe"],
  },
  {
    q: "Qu'aimez-vous faire, ou qu'aimeriez-vous apprendre ?",
    quick: ["La mode", "Les réseaux sociaux", "La cuisine", "L'informatique", "La beauté", "Le commerce"],
  },
];

const AVAILABILITY = ["À temps plein", "À temps partiel", "Les week-ends", "En soirée", "Ponctuellement (missions courtes)"];

type Result = { summary: string; skills: Skill[]; suggestions: Suggestion[]; source: "ia" | "local" };

export default function DecouvertePage() {
  const { profile, setProfile } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [step, setStep] = useState(0); // 0..4 questions, 5 disponibilités, 6 analyse, 7 résultat
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<string[]>(QUESTIONS.map(() => ""));
  const [availability, setAvailability] = useState(profile?.availability ?? "");
  const [result, setResult] = useState<Result | null>(null);
  const [kept, setKept] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const total = QUESTIONS.length + 1;
  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  function addQuick(text: string) {
    setAnswers((a) => a.map((v, i) => (i === step ? (v.includes(text) ? v : v ? `${v.trim().replace(/[.,]$/, "")}, ${text.toLowerCase()}` : text) : v)));
  }

  async function analyze() {
    go(6);
    const text = QUESTIONS.map((q, i) => `Q : ${q.q}\nR : ${answers[i] || "(pas de réponse)"}`).join("\n\n");
    try {
      const [r] = await Promise.all([
        callAi<Omit<Result, "source">>({ kind: "skills", text }),
        new Promise((res) => setTimeout(res, 1600)), // laisser le temps de lire l'écran d'analyse
      ]);
      setResult(r as Result);
      setKept(new Set((r as Result).skills.map((s) => s.name)));
      go(7);
    } catch (e) {
      toast((e as Error).message, "error");
      go(4);
    }
  }

  async function save() {
    if (!profile || !result) return;
    setSaving(true);
    const chosen = result.skills.filter((s) => kept.has(s.name));
    const existing = new Set(profile.skills.map((s) => s.name.toLowerCase()));
    const update: Partial<Profile> = {
      skills: [...profile.skills, ...chosen.filter((s) => !existing.has(s.name.toLowerCase()))],
      suggestions: result.suggestions,
      availability: availability || profile.availability,
      experiences: profile.experiences || [answers[0], answers[2], answers[3]].filter(Boolean).join(". "),
      interests: profile.interests.length ? profile.interests : answers[4].split(",").map((s) => s.trim()).filter(Boolean),
    };
    const { data, error } = await supabase.from("profiles").update(update).eq("id", profile.id).select().single();
    setSaving(false);
    if (error) return toast(`Enregistrement impossible : ${error.message}`, "error");
    setProfile(data as Profile);
    toast(`${chosen.length} compétences ajoutées à votre profil`);
    router.push("/app/opportunites");
  }

  const progress = Math.min(step, total) / total;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <Link href="/app" className="rounded-full px-3 py-2 text-sm font-semibold text-muted hover:bg-plum-50 hover:text-plum">
          {step >= 7 ? "Plus tard" : "Quitter"}
        </Link>
      </header>
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="h-1.5 overflow-hidden rounded-full bg-plum-100" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <motion.div className="h-full rounded-full bg-plum" animate={{ width: `${progress * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-10 pt-8 sm:px-6 sm:pt-14">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.section
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            {step < QUESTIONS.length && (
              <>
                <p className="text-sm font-semibold text-plum">Question {step + 1} sur {QUESTIONS.length}</p>
                <h1 className="font-display mt-3 text-[32px] text-plum sm:text-[44px]">{QUESTIONS[step].q}</h1>
                <p className="mt-3 text-muted">Touchez ce qui vous ressemble, puis complétez avec vos mots. Il n&apos;y a pas de mauvaise réponse.</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {QUESTIONS[step].quick.map((t) => (
                    <Chip key={t} active={answers[step].includes(t) || answers[step].includes(t.toLowerCase())} onClick={() => addQuick(t)}>{t}</Chip>
                  ))}
                </div>
                <div className="mt-5">
                  <Textarea
                    rows={4}
                    aria-label="Votre réponse"
                    value={answers[step]}
                    placeholder="Écrivez ici, même quelques mots suffisent."
                    onChange={(e) => setAnswers(answers.map((a, i) => (i === step ? e.target.value : a)))}
                    className="text-base"
                  />
                </div>
                <Nav
                  onBack={step > 0 ? () => go(step - 1) : undefined}
                  onNext={() => go(step + 1)}
                  nextLabel={answers[step].trim() ? "Continuer" : "Passer cette question"}
                  nextVariant={answers[step].trim() ? "primary" : "ghost"}
                />
              </>
            )}

            {step === QUESTIONS.length && (
              <>
                <p className="text-sm font-semibold text-plum">Dernière étape</p>
                <h1 className="font-display mt-3 text-[32px] text-plum sm:text-[44px]">Quand êtes-vous disponible ?</h1>
                <div className="mt-8 grid gap-2 sm:grid-cols-2">
                  {AVAILABILITY.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvailability(a)}
                      aria-pressed={availability === a}
                      className={`rounded-2xl px-5 py-4 text-left text-[15px] font-semibold transition-colors ${availability === a ? "bg-plum text-white" : "bg-white text-ink ring-1 ring-line hover:ring-plum/40"}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <Nav
                  onBack={() => go(step - 1)}
                  onNext={analyze}
                  nextLabel="Révéler mes compétences"
                  nextVariant="accent"
                  disabled={answers.every((a) => !a.trim())}
                  hint={answers.every((a) => !a.trim()) ? "Répondez à au moins une question pour continuer." : undefined}
                />
              </>
            )}

            {step === 6 && (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="relative h-28 w-28">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-plum"
                      initial={{ scale: 0.4, opacity: 0.8 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                    />
                  ))}
                  <span className="absolute inset-[34%] rounded-full bg-plum" />
                </div>
                <h1 className="font-display mt-10 text-[30px] text-plum sm:text-[38px]">Lecture de vos réponses…</h1>
                <p className="mt-3 max-w-sm text-muted">Nous cherchons les compétences cachées dans votre quotidien.</p>
              </div>
            )}

            {step === 7 && result && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-[32px] text-plum sm:text-[44px]">Voici ce que vous savez faire</h1>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <AiBadge source={result.source} />
                </div>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{result.summary}</p>

                <p className="mt-8 text-sm font-semibold text-ink">Gardez celles qui vous correspondent. Touchez pour retirer.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.skills.map((s, i) => {
                    const on = kept.has(s.name);
                    return (
                      <motion.button
                        key={s.name}
                        initial={{ opacity: 0, scale: 0.3, y: 14 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 480, damping: 20, delay: 0.15 + i * 0.09 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setKept((k) => { const n = new Set(k); if (n.has(s.name)) n.delete(s.name); else n.add(s.name); return n; })}
                        aria-pressed={on}
                        className={`rounded-full px-4 py-2.5 text-[15px] font-semibold transition-colors ${on ? "bg-plum text-white" : "bg-white text-muted line-through ring-1 ring-line"}`}
                      >
                        {s.name}
                      </motion.button>
                    );
                  })}
                </div>

                {result.suggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + result.skills.length * 0.09 }}>
                    <h2 className="font-display mt-12 text-[26px] text-plum">Des activités qui pourraient vous rapporter</h2>
                    <ul className="mt-4 divide-y divide-line rounded-[22px] bg-white ring-1 ring-line">
                      {result.suggestions.map((s) => (
                        <li key={s.title} className="p-5">
                          <p className="font-semibold text-ink">{s.title}</p>
                          <p className="mt-1 text-muted">{s.description}</p>
                          <p className="mt-3 text-[15px] text-plum"><span className="font-semibold">Pour commencer cette semaine :</span> {s.firstStep}</p>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <div className="sticky bottom-0 -mx-4 mt-10 bg-gradient-to-t from-bg via-bg to-bg/0 px-4 pb-4 pt-6 sm:static sm:mx-0 sm:bg-none sm:p-0">
                  <Button variant="accent" loading={saving} disabled={kept.size === 0} onClick={save} className="w-full py-4 text-base sm:w-auto sm:px-8">
                    Enregistrer et voir mes missions
                  </Button>
                </div>
              </>
            )}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Nav({
  onBack, onNext, nextLabel, nextVariant = "primary", disabled, hint,
}: { onBack?: () => void; onNext: () => void; nextLabel: string; nextVariant?: "primary" | "accent" | "ghost"; disabled?: boolean; hint?: string }) {
  return (
    <div className="mt-auto pt-10">
      {hint && <p className="mb-3 text-sm text-muted">{hint}</p>}
      <div className="flex items-center justify-between gap-3">
        {onBack ? <Button variant="ghost" onClick={onBack}>Précédent</Button> : <span />}
        <Button variant={nextVariant} onClick={onNext} disabled={disabled} className="px-7">{nextLabel}</Button>
      </div>
    </div>
  );
}
