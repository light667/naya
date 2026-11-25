"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useToast } from "@/components/Toast";
import { Badge, Empty, Sheet, Tabs } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import type { AssistantDraft, AssistantKind } from "@/lib/types";

const LABELS: Record<AssistantKind, string> = { candidature: "Candidatures", services: "Services", rendezvous: "Rendez-vous" };

/** Historique des générations : rouvrir, modifier, supprimer, retrouver la mission et l'analyse. */
export function HistoryPanel({ open, onClose, initialKind, userId, onOpen }: { open: boolean; onClose: () => void; initialKind: AssistantKind; userId: string; onOpen: (d: AssistantDraft) => void }) {
  const toast = useToast();
  const [kind, setKind] = useState<AssistantKind>(initialKind);
  const [drafts, setDrafts] = useState<AssistantDraft[] | null>(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { if (open) setKind(initialKind); }, [open, initialKind]);

  useEffect(() => {
    if (!open) return;
    setDrafts(null);
    supabase
      .from("assistant_drafts")
      .select("*, opportunities(id, title, organization)")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => { setError(!!error); setDrafts((data as AssistantDraft[]) ?? []); });
  }, [open, userId]);

  async function remove(id: string) {
    setDrafts((l) => l!.filter((d) => d.id !== id));
    const { error } = await supabase.from("assistant_drafts").delete().eq("id", id);
    toast(error ? error.message : "Brouillon supprimé", error ? "error" : "success");
  }

  const list = (drafts ?? []).filter((d) => d.kind === kind);

  return (
    <Sheet open={open} onClose={onClose} title="Historique">
      <h2 className="font-display pr-10 text-[28px] text-plum">Historique</h2>
      <p className="mt-1 text-sm text-muted">Chaque texte généré est enregistré automatiquement, avec vos modifications.</p>
      <div className="mt-4">
        <Tabs tabs={(Object.keys(LABELS) as AssistantKind[]).map((k) => ({ id: k, label: `${LABELS[k]} (${(drafts ?? []).filter((d) => d.kind === k).length})` }))} value={kind} onChange={setKind} />
      </div>

      <div className="mt-5">
        {drafts === null ? (
          <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-plum-50" />)}</div>
        ) : error ? (
          <Empty title="Historique indisponible" text="La table d'historique n'existe pas encore. Exécutez la migration 002 dans Supabase." />
        ) : list.length === 0 ? (
          <Empty title="Rien pour l'instant" text="Les textes que vous générez apparaîtront ici." />
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {list.map((d) => (
                <motion.li key={d.id} layout exit={{ opacity: 0, x: -20 }} className="rounded-2xl bg-bg p-4 ring-1 ring-line">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug text-ink">{d.title || LABELS[d.kind]}</p>
                      <p className="text-xs text-muted">
                        Modifié le {new Date(d.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {d.analysis && <Badge tone={d.analysis.score === null ? "amber" : "sage"}>{d.analysis.score === null ? "Analyse incomplète" : `${d.analysis.score} %`}</Badge>}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{d.content}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <button onClick={() => { onOpen(d); onClose(); }} className="rounded-full bg-plum px-4 py-2 font-semibold text-white hover:bg-plum-700">Ouvrir et modifier</button>
                    {d.analysis && <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} className="rounded-full px-3 py-2 font-semibold text-plum hover:bg-plum-50">{expanded === d.id ? "Masquer l'analyse" : "Voir l'analyse"}</button>}
                    {d.opportunities && <Link href={`/app/opportunites?o=${d.opportunities.id}`} className="rounded-full px-3 py-2 font-semibold text-plum hover:bg-plum-50">Voir la mission</Link>}
                    <button onClick={() => remove(d.id)} className="ml-auto rounded-full px-3 py-2 font-semibold text-red-700 hover:bg-red-50">Supprimer</button>
                  </div>
                  {expanded === d.id && d.analysis && (
                    <div className="mt-3 space-y-2 rounded-xl bg-white p-3 text-sm">
                      {d.analysis.criteria.map((c) => <p key={c.id}><span className="font-semibold">{c.label}</span> : {Math.round(c.earned)}/{c.weight} — {c.detail}</p>)}
                      {d.analysis.strengths.length > 0 && <p className="text-sage-700">Points forts : {d.analysis.strengths.join(" ")}</p>}
                      {d.analysis.gaps.length > 0 && <p className="text-sun-900">À renforcer : {d.analysis.gaps.join(" ")}</p>}
                    </div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </Sheet>
  );
}
