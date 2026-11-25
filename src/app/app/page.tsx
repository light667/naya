"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: string;
  location: string;
  created_at: string;
  skills: string[];
};

type Application = {
  id: string;
  status: string;
  opportunity: Opportunity;
};

const STATUS: Record<string, string> = { a_postuler: "À envoyer", envoyee: "Envoyée", entretien: "Entretien", acceptee: "Acceptée", refusee: "Refusée" };

// Conseil qui change chaque jour (à déplacer en base plus tard pour pouvoir le modifier)
const TIPS = [
  "Une photo nette de ton travail vaut mieux qu'un long texte. Prends-la à la lumière du jour.",
  "Avant un entretien, prépare un exemple précis : une commande difficile et comment tu l'as réussie.",
  "Note tes prix et le temps passé sur chaque travail. Tu sauras mieux fixer ton tarif.",
  "Un employeur sérieux ne te demandera jamais d'argent pour postuler.",
  "Réponds vite aux messages WhatsApp des clients : c'est souvent ce qui fait la différence.",
  "Garde un carnet de tes clients fidèles. Ils sont tes meilleures références.",
  "Même appris en famille ou au marché, ton savoir-faire compte. Raconte-le simplement.",
];

export default function DashboardPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const firstName = (profile?.full_name || session?.user?.user_metadata?.full_name || "").trim().split(/\s+/)[0];
  const hasSkills = Array.isArray(profile?.skills) && profile.skills.length > 0;
  const hasBasics = !!(profile?.city || profile?.bio);
  const hasApplied = applications.length > 0;

  const checklist = [
    { done: true, label: "Créer ton compte", gain: 25, href: "/profil" },
    { done: hasSkills, label: "Créer ta carte de compétences", gain: 25, href: "/assistant-ia" },
    { done: hasBasics, label: "Ajouter ta ville et une phrase sur toi", gain: 25, href: "/profil" },
    { done: hasApplied, label: "Postuler à une offre", gain: 25, href: "/opportunites" },
  ];
  const completion = checklist.reduce((a, c) => a + (c.done ? c.gain : 0), 0);

  const next = !hasSkills
    ? { text: "Raconte ce que tu sais faire. L'assistant en fait ta carte de compétences.", cta: "Créer ma carte de compétences", href: "/assistant-ia" }
    : !hasBasics
      ? { text: "Ajoute ta ville et une phrase sur toi pour que les employeurs te trouvent.", cta: "Compléter mon profil", href: "/profil" }
      : !hasApplied
        ? { text: "Ta carte est prête. Choisis une offre près de chez toi et postule.", cta: "Voir les offres", href: "/opportunites" }
        : { text: "Suis tes candidatures et prépare tes entretiens avec l'assistant.", cta: "Préparer un entretien", href: "/assistant-ia" };

  const tip = TIPS[Math.floor(Date.now() / 86_400_000) % TIPS.length];

  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      const { data: opps } = await supabase.from("opportunities").select("*").eq("status", "verifiee").order("created_at", { ascending: false }).limit(4);
      if (opps && opps.length > 0) setOpportunities(opps as Opportunity[]);

      if (session?.user?.id) {
        const { data: apps } = await supabase.from("applications").select("id, status, opportunity:opportunities(*)").eq("user_id", session.user.id);
        if (apps) setApplications(apps as unknown as Application[]);
      }
      setLoadingData(false);
    }
    if (!authLoading) loadData();
  }, [session, authLoading]);

  return (
    <div className="space-y-16">
      {/* La seule chose à regarder : la prochaine étape */}
      <section className="max-w-2xl">
        <h1 className="text-[36px] font-semibold leading-[1.1] text-ink sm:text-5xl">{firstName ? `Bonjour ${firstName}` : "Bonjour"}</h1>
        {!firstName && !authLoading && (
          <Link href="/profil" className="mt-2 inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4 hover:text-ink">
            Ajoute ton prénom
          </Link>
        )}
        <p className="mt-4 text-lg text-muted">{next.text}</p>
        <Link
          href={next.href}
          className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-sun px-6 text-base font-semibold text-white transition-colors hover:bg-sun-700 active:scale-[0.98] sm:w-auto"
        >
          {next.cta}
        </Link>
      </section>

      {/* Le reste, en retrait */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 space-y-12">
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-ink">Mes candidatures</h2>
              <span className="text-xs tabular-nums text-muted">{applications.length}</span>
            </div>
            {applications.length > 0 ? (
              <ul className="mt-4 divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
                {applications.map((app) => (
                  <li key={app.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{app.opportunity?.title || "Mission"}</p>
                      <p className="truncate text-xs text-muted">{app.opportunity?.organization}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{STATUS[app.status] ?? "En cours"}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">{loadingData ? "Chargement…" : "Pas encore de candidature."}</p>
            )}
          </section>

          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-ink">Offres récentes</h2>
              <Link href="/opportunites" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink">
                Tout voir
              </Link>
            </div>
            {opportunities.length > 0 ? (
              <ul className="mt-2 divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
                {opportunities.map((opp) => (
                  <li key={opp.id}>
                    <Link href={`/app/assistant?mode=candidature&o=${opp.id}`} className="group flex items-center justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink group-hover:text-sun">{opp.title}</p>
                        <p className="truncate text-xs text-muted">
                          {opp.organization}
                          {opp.location ? ` · ${opp.location}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-sun">Postuler</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">{loadingData ? "Chargement…" : "Aucune offre pour le moment."}</p>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-12">
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-ink">Mon profil</h2>
              <span className="text-xs tabular-nums text-muted">{completion} %</span>
            </div>
            <ul className="mt-4 space-y-1">
              {checklist.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="flex min-h-11 items-center gap-3 text-sm">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${c.done ? "bg-sage text-white" : "ring-1 ring-inset ring-slate-300"}`}
                      aria-hidden
                    >
                      {c.done && (
                        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="m4 8.5 2.5 2.5L12 5.5" />
                        </svg>
                      )}
                    </span>
                    <span className={c.done ? "text-muted line-through decoration-slate-300" : "text-ink"}>{c.label}</span>
                    {!c.done && <span className="ml-auto text-xs tabular-nums text-muted">+{c.gain} %</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink">Conseil du jour</h2>
            <p className="mt-3 text-sm text-muted">{tip}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
