"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Badge, Button, Empty, PageHeader, Tabs } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import type { Opportunity } from "@/lib/types";

type Report = { id: string; opportunity_id: string; reason: string; created_at: string };

// Signaux simples d'offre potentiellement frauduleuse
const RED_FLAGS: [RegExp, string][] = [
  [/frais|inscription payante|paiement d'avance/i, "Demande de frais"],
  [/western union|mobile money.*(avant|d'abord)/i, "Paiement à l'avance"],
  [/gagnez .* sans|revenus? garantis?/i, "Promesse de gain facile"],
  [/urgent.*argent/i, "Pression sur l'argent"],
];

export default function ModerationPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<"attente" | "signalees">("attente");
  const [pending, setPending] = useState<Opportunity[]>([]);
  const [reported, setReported] = useState<(Opportunity & { reports: Report[] })[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase.from("opportunities").select("*").eq("status", "en_attente").order("created_at");
    setPending((data as Opportunity[]) ?? []);
    const { data: reps } = await supabase.from("opportunity_reports").select("*").order("created_at", { ascending: false });
    const r = (reps as Report[]) ?? [];
    if (!r.length) return setReported([]);
    const { data: o } = await supabase.from("opportunities").select("*").in("id", [...new Set(r.map((x) => x.opportunity_id))]).eq("status", "verifiee");
    setReported(((o as Opportunity[]) ?? []).map((x) => ({ ...x, reports: r.filter((y) => y.opportunity_id === x.id) })));
  }, []);

  useEffect(() => { if (profile?.role === "admin") load(); }, [profile, load]);

  async function setStatus(id: string, status: Opportunity["status"]) {
    setPending((l) => l.filter((o) => o.id !== id));
    setReported((l) => l.filter((o) => o.id !== id));
    const { error } = await supabase.from("opportunities").update({ status }).eq("id", id);
    toast(error ? error.message : status === "verifiee" ? "Offre validée et mise en ligne" : "Offre retirée", error ? "error" : "success");
    if (error) load();
  }

  if (profile?.role !== "admin") return <Empty title="Accès réservé" text="Cette page est réservée à l'équipe de modération PHAR." />;

  const list = tab === "attente" ? pending : reported;

  return (
    <div>
      <PageHeader title="Modération" subtitle="Vérifiez chaque offre avant publication pour protéger les utilisatrices." />
      <Tabs tabs={[{ id: "attente", label: `À vérifier (${pending.length})` }, { id: "signalees", label: `Signalées (${reported.length})` }]} value={tab} onChange={setTab} />

      <div className="mt-6">
        {list.length === 0 ? (
          <Empty icon="✓" title={tab === "attente" ? "Tout est vérifié" : "Aucun signalement"} text={tab === "attente" ? "Aucune offre n'attend de vérification." : "Les offres signalées par les utilisatrices apparaîtront ici."} />
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {list.map((o) => {
                const flags = RED_FLAGS.filter(([r]) => r.test(`${o.title} ${o.description} ${o.pay}`)).map(([, l]) => l);
                const reports = "reports" in o ? (o as { reports: Report[] }).reports : [];
                return (
                  <motion.li key={o.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 40 }} className="rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-ink">{o.title}</p>
                        <p className="text-sm text-muted">{o.organization} ({o.org_type}), {o.location || "lieu non précisé"}. Contact : {o.contact}</p>
                      </div>
                      {flags.length ? <Badge tone="red">{flags.join(", ")}</Badge> : <Badge tone="sage">Aucun signal détecté</Badge>}
                    </div>
                    <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink">{o.description}</p>
                    <p className="mt-2 font-semibold text-plum">{o.pay}</p>
                    {reports.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {reports.map((r) => <li key={r.id} className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-900">« {r.reason} »</li>)}
                      </ul>
                    )}
                    <div className="mt-5 flex gap-2">
                      {tab === "attente" && <Button variant="primary" onClick={() => setStatus(o.id, "verifiee")}>Valider et publier</Button>}
                      <Button variant="danger" onClick={() => setStatus(o.id, "rejetee")}>{tab === "attente" ? "Refuser" : "Retirer l'offre"}</Button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
