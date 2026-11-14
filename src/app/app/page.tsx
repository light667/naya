"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { Badge, ButtonLink, ScoreRing, VerifiedBadge } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { localMatch } from "@/lib/naya-local";
import { STATUS_LABELS, type Application, type Opportunity, type Profile } from "@/lib/types";

type Next = { title: string; text: string; href: string; cta: string };

function nextStep(p: Profile, apps: Application[], portfolio: number): Next {
  if (p.skills.length === 0)
    return { title: "Commencez par révéler vos compétences", text: "Cinq questions sur votre quotidien, et l'IA met des mots sur ce que vous savez faire.", href: "/app/decouverte", cta: "Lancer la découverte" };
  const draft = apps.find((a) => a.status === "a_postuler");
  if (draft)
    return { title: `Postulez à « ${draft.opportunities?.title ?? "votre mission"} »`, text: "L'assistante vous propose un message de candidature à partir de votre profil.", href: `/app/assistant?mode=candidature&o=${draft.opportunity_id}`, cta: "Rédiger ma candidature" };
  const meeting = apps.find((a) => a.status === "entretien");
  if (meeting)
    return { title: "Préparez votre rendez-vous", text: `Un échange est prévu avec ${meeting.opportunities?.organization ?? "un recruteur"}. Entraînez-vous avec l'assistante.`, href: `/app/assistant?mode=entretien&o=${meeting.opportunity_id}`, cta: "Préparer l'échange" };
  if (!p.bio || !p.city)
    return { title: "Complétez votre profil", text: "Une courte présentation et votre ville aident les recruteurs à vous faire confiance.", href: "/app/profil", cta: "Compléter mon profil" };
  if (portfolio === 0)
    return { title: "Ajoutez une première réalisation", text: "Une photo de votre travail vaut mieux qu'un long discours.", href: "/app/profil?tab=portfolio", cta: "Ajouter une réalisation" };
  return { title: "De nouvelles missions vous attendent", text: "Les offres sont classées selon vos compétences, avec la raison de chaque suggestion.", href: "/app/opportunites", cta: "Voir les missions" };
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [portfolio, setPortfolio] = useState(0);
  const [myOffers, setMyOffers] = useState<Opportunity[]>([]);

  useEffect(() => {
    if (!profile) return;
    supabase.from("opportunities").select("*").eq("status", "verifiee").then(({ data }) => setOpps((data as Opportunity[]) ?? []));
    supabase.from("applications").select("*, opportunities(*)").eq("user_id", profile.id).order("updated_at", { ascending: false }).then(({ data }) => setApps((data as Application[]) ?? []));
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }).eq("user_id", profile.id).then(({ count }) => setPortfolio(count ?? 0));
    if (profile.role !== "talent") supabase.from("opportunities").select("*").eq("created_by", profile.id).then(({ data }) => setMyOffers((data as Opportunity[]) ?? []));
  }, [profile]);

  if (!profile) return null;
  const first = profile.full_name.split(" ")[0] || "";
  const hello = new Date().getHours() < 18 ? "Bonjour" : "Bonsoir";

  if (profile.role === "recruteur") {
    const pending = myOffers.filter((o) => o.status === "en_attente").length;
    return (
      <div>
        <h1 className="font-display text-[38px] text-plum sm:text-[48px]">{hello} {first}</h1>
        <NextCard
          next={{
            title: myOffers.length ? "Publiez une nouvelle mission" : "Publiez votre première mission",
            text: "Elle sera vérifiée par l'équipe NAYA, puis proposée aux profils qui correspondent.",
            href: "/app/publier",
            cta: "Publier une mission",
          }}
        />
        <dl className="mt-8 grid grid-cols-3 gap-3">
          <Stat value={myOffers.length} label="offres publiées" />
          <Stat value={myOffers.filter((o) => o.status === "verifiee").length} label="en ligne" />
          <Stat value={pending} label="en vérification" />
        </dl>
      </div>
    );
  }

  const checks = [!!profile.city, !!profile.bio, profile.skills.length >= 3, !!profile.availability, portfolio > 0, !!profile.headline];
  const completion = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const top = localMatch(profile, opps).slice(0, 6);
  const byId = new Map(opps.map((o) => [o.id, o]));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[38px] text-plum sm:text-[48px]">{hello} {first}</h1>
          <p className="mt-1 text-[17px] text-muted">Voici votre prochaine étape.</p>
        </div>
        <Link href="/app/profil" className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-1.5 ring-1 ring-line hover:ring-plum/30 sm:pr-4" aria-label={`Profil complété à ${completion} %`}>
          <ScoreRing value={completion} size={42} label={false} />
          <span className="hidden text-sm sm:block"><span className="font-bold text-ink">{completion} %</span> <span className="text-muted">du profil</span></span>
        </Link>
      </div>

      <NextCard next={nextStep(profile, apps, portfolio)} />

      {top.length > 0 && profile.skills.length > 0 && (
        <section className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-[26px] text-plum">Missions pour vous</h2>
            <Link href="/app/opportunites" className="text-[15px] font-semibold text-plum hover:underline">Tout voir</Link>
          </div>
          <div className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
            {top.map((m) => {
              const o = byId.get(m.opportunityId)!;
              return (
                <Link
                  key={o.id}
                  href={`/app/opportunites?o=${o.id}`}
                  className="flex w-[78%] shrink-0 snap-start flex-col rounded-[22px] bg-white p-5 ring-1 ring-line transition-shadow hover:shadow-[0_16px_40px_-20px_rgba(74,21,75,0.35)] sm:w-[46%] lg:w-auto"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold leading-snug text-ink">{o.title}</p>
                    <ScoreRing value={m.score} size={44} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{o.organization}</p>
                  <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted">{m.reason}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-plum">{o.pay}</span>
                    <VerifiedBadge />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {apps.length > 0 && (
          <section>
            <h2 className="font-display text-[26px] text-plum">Vos candidatures</h2>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[22px] bg-white ring-1 ring-line">
              {apps.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <Link href="/app/candidatures" className="flex items-center justify-between gap-3 p-4 hover:bg-plum-50/50">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink">{a.opportunities?.title}</span>
                      <span className="block truncate text-sm text-muted">{a.opportunities?.organization}</span>
                    </span>
                    <Badge tone={a.status === "acceptee" ? "sage" : a.status === "refusee" ? "red" : "plum"}>{STATUS_LABELS[a.status]}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {profile.suggestions.length > 0 && (
          <section>
            <h2 className="font-display text-[26px] text-plum">Idées d&apos;activités</h2>
            <ul className="mt-4 space-y-3">
              {profile.suggestions.slice(0, 3).map((s) => (
                <li key={s.title} className="rounded-[22px] bg-white p-5 ring-1 ring-line">
                  <p className="font-semibold text-ink">{s.title}</p>
                  <p className="mt-1 text-sm text-muted">{s.firstStep}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function NextCard({ next }: { next: Next }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-7 overflow-hidden rounded-[30px] bg-plum p-7 text-white sm:p-10"
    >
      <motion.span
        aria-hidden
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] border-white/[0.06]"
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <p className="relative text-sm font-semibold text-white/70">Prochaine étape</p>
      <h2 className="font-display relative mt-2 max-w-xl text-[28px] sm:text-[38px]">{next.title}</h2>
      <p className="relative mt-3 max-w-lg text-white/75">{next.text}</p>
      <ButtonLink href={next.href} variant="accent" className="relative mt-7 px-7 py-3.5">{next.cta}</ButtonLink>
    </motion.section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col-reverse rounded-[22px] bg-white p-5 ring-1 ring-line">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-display text-[36px] text-plum">{value}</dd>
    </div>
  );
}
