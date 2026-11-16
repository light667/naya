"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { AiBadge, Badge, Button, ButtonLink, Chip, Empty, PageHeader, ScoreRing, Sheet, Textarea, VerifiedBadge } from "@/components/ui";
import { Icon } from "@/components/icons";
import { supabase } from "@/lib/supabase";
import { callAi } from "@/lib/ai-client";
import { rankOpportunities } from "@/lib/matching";
import type { Application, Match, Opportunity, PortfolioItem } from "@/lib/types";

const ORG_LABEL = { entreprise: "Entreprise", association: "Association", particulier: "Particulier" };

function OpportunitesInner() {
  const { profile } = useAuth();
  const toast = useToast();
  const params = useSearchParams();
  const router = useRouter();
  const [opps, setOpps] = useState<Opportunity[] | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [source, setSource] = useState<"ia" | "local" | null>(null);
  const [ranking, setRanking] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const selectedId = params.get("o");

  useEffect(() => {
    if (!profile) return;
    supabase.from("opportunities").select("*").eq("status", "verifiee").order("created_at", { ascending: false }).then(({ data }) => {
      const list = (data as Opportunity[]) ?? [];
      setOpps(list);
    });
    supabase.from("portfolio_items").select("*").eq("user_id", profile.id).then(({ data }) => setItems((data as PortfolioItem[]) ?? []));
    supabase.from("applications").select("*").eq("user_id", profile.id).then(({ data }) => setApps((data as Application[]) ?? []));
  }, [profile]);

  // Score identique à celui de l'assistante (calcul pondéré, jamais généré par l'IA)
  useEffect(() => {
    if (profile && opps) setMatches((prev) => {
      const fresh = rankOpportunities(profile, opps, items);
      const reasons = new Map((prev ?? []).map((m) => [m.opportunityId, m.reason]));
      return source === "ia" ? fresh.map((m) => ({ ...m, reason: reasons.get(m.opportunityId) ?? m.reason })) : fresh;
    });
  }, [profile, opps, items]); // eslint-disable-line react-hooks/exhaustive-deps

  const scoreOf = useMemo(() => new Map((matches ?? []).map((m) => [m.opportunityId, m])), [matches]);
  const categories = [...new Set((opps ?? []).map((o) => o.category))].sort();
  const isTalent = profile?.role !== "recruteur";

  const filtered = (opps ?? [])
    .filter((o) => !cat || o.category === cat)
    .filter((o) => !remoteOnly || o.remote)
    .filter((o) => !q || `${o.title} ${o.organization} ${o.description} ${o.skills.join(" ")} ${o.location}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (isTalent ? (scoreOf.get(b.id)?.score ?? 0) - (scoreOf.get(a.id)?.score ?? 0) : 0));

  async function rankWithAi() {
    if (!profile || !opps) return;
    setRanking(true);
    try {
      const r = await callAi<{ reasons: Record<string, string>; busy?: boolean }>({ kind: "match_reasons" });
      if (r.source === "local" || !Object.keys(r.reasons).length) {
        toast(r.busy ? "L'IA est très sollicitée : les explications restent celles du calcul. Réessayez dans quelques minutes." : "L'IA n'est pas disponible : les explications restent celles du calcul.", "error");
      } else {
        setMatches((list) => (list ?? []).map((m) => ({ ...m, reason: r.reasons[m.opportunityId] ?? m.reason })));
        setSource("ia");
        toast("Explications personnalisées par l'IA");
      }
    } catch (e) {
      toast((e as Error).message, "error");
    }
    setRanking(false);
  }

  const selected = opps?.find((o) => o.id === selectedId) ?? null;
  const open = (id: string | null) => router.replace(id ? `/app/opportunites?o=${id}` : "/app/opportunites", { scroll: false });

  return (
    <div>
      <PageHeader
        title="Missions"
        subtitle={isTalent ? "Toutes vérifiées, classées selon vos compétences." : "Les missions actuellement en ligne sur NAYA."}
        action={isTalent && (
          <div className="flex items-center gap-2">
            <AiBadge source={source} />
            <Button variant="primary" loading={ranking} onClick={rankWithAi} disabled={!opps?.length}>Expliquer avec l&apos;IA</Button>
          </div>
        )}
      />

      {isTalent && profile && profile.skills.length === 0 && (
        <Link href="/app/decouverte" className="mb-6 flex items-center justify-between gap-4 rounded-[22px] bg-coral-50 p-5 ring-1 ring-coral/30">
          <span className="text-ink"><span className="font-semibold">Recommandations plus précises.</span> Révélez d&apos;abord vos compétences en cinq questions.</span>
          <span className="shrink-0 font-semibold text-plum">Commencer</span>
        </Link>
      )}

      <div className="sticky top-[60px] z-20 -mx-4 bg-bg/90 px-4 pb-3 pt-1 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-0 lg:mx-0 lg:px-0">
        <label className="relative block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"><Icon.search /></span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Couture, Lomé, Canva…"
            aria-label="Rechercher une mission"
            className="w-full rounded-full border border-line bg-white py-3.5 pl-12 pr-4 text-[15px] focus:border-plum focus:outline-none focus:ring-4 focus:ring-plum/10"
          />
        </label>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          <Chip active={!cat && !remoteOnly} onClick={() => { setCat(""); setRemoteOnly(false); }}>Toutes</Chip>
          <Chip active={remoteOnly} onClick={() => setRemoteOnly(!remoteOnly)}>À distance</Chip>
          {categories.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? "" : c)}>{c}</Chip>)}
        </div>
      </div>

      {opps === null ? (
        <div className="mt-4 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-[22px] bg-white ring-1 ring-line" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="mt-4"><Empty icon="⌕" title="Aucune mission ne correspond" text="Retirez un filtre ou essayez un autre mot-clé." action={<Button variant="secondary" onClick={() => { setQ(""); setCat(""); setRemoteOnly(false); }}>Effacer les filtres</Button>} /></div>
      ) : (
        <LayoutGroup>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            <AnimatePresence initial={false}>
              {filtered.map((o) => {
                const m = scoreOf.get(o.id);
                const tracked = apps.some((a) => a.opportunity_id === o.id);
                return (
                  <motion.li key={o.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 36 }}>
                    <button
                      onClick={() => open(o.id)}
                      className="flex h-full w-full flex-col rounded-[22px] bg-white p-5 text-left ring-1 ring-line transition-shadow hover:shadow-[0_16px_40px_-20px_rgba(42,27,110,0.35)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-plum">{o.category}</p>
                          <h3 className="mt-1 text-lg font-bold leading-snug text-ink">{o.title}</h3>
                          <p className="mt-0.5 text-sm text-muted">{o.organization}</p>
                        </div>
                        {isTalent && m && (m.complete ? <ScoreRing value={m.score} /> : <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-sun-50 text-lg font-bold text-sun-800" title="Analyse incomplète">?</span>)}
                      </div>
                      {isTalent && m && <p className="mt-3 line-clamp-2 text-sm text-muted">{m.reason}</p>}
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 text-muted"><Icon.pin />{o.remote ? "À distance" : o.location}</span>
                        <span className="font-semibold text-plum">{o.pay}</span>
                        <span className="ml-auto flex gap-2">
                          {tracked && <Badge tone="plum">Suivie</Badge>}
                          <VerifiedBadge />
                        </span>
                      </div>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </LayoutGroup>
      )}

      <Detail
        opp={selected}
        match={selected ? scoreOf.get(selected.id) : undefined}
        tracked={!!selected && apps.some((a) => a.opportunity_id === selected.id)}
        canApply={isTalent}
        onClose={() => open(null)}
        onTracked={(a) => setApps((list) => [...list.filter((x) => x.id !== a.id), a])}
      />
    </div>
  );
}

function Detail({
  opp, match, tracked, canApply, onClose, onTracked,
}: { opp: Opportunity | null; match?: Match; tracked: boolean; canApply: boolean; onClose: () => void; onTracked: (a: Application) => void }) {
  const { profile } = useAuth();
  const toast = useToast();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setReporting(false); setReason(""); }, [opp?.id]);

  async function track() {
    if (!opp) return;
    setBusy(true);
    const { data, error } = await supabase.from("applications").upsert({ user_id: profile!.id, opportunity_id: opp.id, status: "a_postuler" }, { onConflict: "user_id,opportunity_id" }).select().single();
    setBusy(false);
    if (error) return toast(error.message, "error");
    onTracked(data as Application);
    toast("Mission ajoutée à votre suivi");
  }

  async function report() {
    if (!opp || !reason.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("opportunity_reports").insert({ opportunity_id: opp.id, user_id: profile!.id, reason });
    setBusy(false);
    setReporting(false);
    if (error) toast(error.code === "23505" ? "Vous avez déjà signalé cette offre." : error.message, "error");
    else toast("Signalement envoyé. L'équipe NAYA va réexaminer l'offre.");
  }

  return (
    <Sheet
      open={!!opp}
      onClose={onClose}
      title={opp?.title}
      footer={canApply && opp && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {tracked ? (
            <ButtonLink href="/app/candidatures" variant="secondary">Voir dans mon suivi</ButtonLink>
          ) : (
            <Button variant="secondary" loading={busy} onClick={track}>Ajouter à mon suivi</Button>
          )}
          <ButtonLink href={`/app/assistant?mode=candidature&o=${opp.id}`} variant="accent" className="px-7">Postuler avec l&apos;assistante</ButtonLink>
        </div>
      )}
    >
      {opp && (
        <div>
          <div className="flex flex-wrap items-center gap-2 pr-10">
            <VerifiedBadge />
            <Badge tone="neutral">{opp.category}</Badge>
          </div>
          <h2 className="font-display mt-4 text-[30px] text-plum sm:text-[36px]">{opp.title}</h2>
          <p className="mt-1 text-muted">{opp.organization}, {ORG_LABEL[opp.org_type].toLowerCase()}</p>

          {canApply && match && match.complete && (
            <div className="mt-5 flex items-center gap-4 rounded-2xl bg-plum-50 p-4">
              <ScoreRing value={match.score} size={56} />
              <div>
                <p className="font-semibold text-ink">Compatible à {match.score} %</p>
                <p className="text-sm text-muted">{match.reason}</p>
              </div>
            </div>
          )}

          {canApply && match && !match.complete && <p className="mt-5 rounded-2xl bg-sun-50 p-4 text-sm text-sun-900">{match.reason}</p>}
          <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-muted">Lieu</dt><dd className="mt-0.5 font-semibold text-ink">{opp.remote ? "À distance" : opp.location || "À préciser"}</dd></div>
            <div><dt className="text-muted">Rémunération</dt><dd className="mt-0.5 font-semibold text-plum">{opp.pay || "À discuter"}</dd></div>
            <div><dt className="text-muted">Contact</dt><dd className="mt-0.5 break-words font-semibold text-ink">{opp.contact || "Via NAYA"}</dd></div>
          </dl>

          <p className="mt-6 whitespace-pre-line text-[16px] leading-relaxed text-ink">{opp.description}</p>
          {opp.skills.length > 0 && (
            <>
              <p className="mt-6 text-sm font-semibold text-ink">Compétences demandées</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {opp.skills.map((s) => {
                  const mine = profile?.skills.some((k) => k.name.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(k.name.toLowerCase()));
                  return <Badge key={s} tone={mine ? "sage" : "neutral"}>{mine && "✓ "}{s}</Badge>;
                })}
              </div>
            </>
          )}

          <div className="mt-8 rounded-2xl bg-sun-50 p-4 text-sm text-sun-900">
            <p><span className="font-semibold">Restez prudente.</span> Une vraie mission ne demande jamais de frais. Rencontrez le recruteur dans un lieu public et prévenez un proche.</p>
            <AnimatePresence initial={false} mode="wait">
              {reporting ? (
                <motion.div key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-3 space-y-2">
                    <Textarea rows={2} placeholder="Qu'est-ce qui vous paraît suspect ?" value={reason} onChange={(e) => setReason(e.target.value)} />
                    <div className="flex gap-2">
                      <Button variant="danger" loading={busy} disabled={!reason.trim()} onClick={report}>Envoyer le signalement</Button>
                      <Button variant="ghost" onClick={() => setReporting(false)}>Annuler</Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.button key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setReporting(true)} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-red-800 hover:underline">
                  <Icon.flag /> Signaler cette offre
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </Sheet>
  );
}

export default function OpportunitesPage() {
  return (
    <Suspense>
      <OpportunitesInner />
    </Suspense>
  );
}
