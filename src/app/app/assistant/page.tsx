"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { Button, PageHeader, Tabs } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import type { AssistantDraft, AssistantKind, MeetingSituation, Opportunity, PortfolioItem } from "@/lib/types";
import { CandidatureTab } from "@/components/assistant/CandidatureTab";
import { ServicesTab } from "@/components/assistant/ServicesTab";
import { RendezvousTab } from "@/components/assistant/RendezvousTab";
import { HistoryPanel } from "@/components/assistant/HistoryPanel";

const MODES: { id: AssistantKind; label: string; desc: string }[] = [
  { id: "candidature", label: "Candidature", desc: "L'assistante analyse la mission et votre profil, calcule votre compatibilité, puis rédige une candidature adaptée." },
  { id: "services", label: "Mes services", desc: "Proposez vos services à un particulier, un commerce ou une organisation, selon son besoin." },
  { id: "rendezvous", label: "Rendez-vous", desc: "Demander, confirmer, relancer ou reporter un rendez-vous, et vous y préparer." },
];

// Compatibilité avec les anciens liens (?mode=entretien, ?mode=presentation)
const LEGACY: Record<string, AssistantKind> = { entretien: "rendezvous", presentation: "services" };

function AssistantInner() {
  const { profile } = useAuth();
  const params = useSearchParams();
  const rawMode = params.get("mode") ?? "candidature";
  const [mode, setMode] = useState<AssistantKind>(LEGACY[rawMode] ?? (rawMode as AssistantKind));
  const [opps, setOpps] = useState<Opportunity[] | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [history, setHistory] = useState(false);
  const [restore, setRestore] = useState<AssistantDraft | null>(null);
  const [instance, setInstance] = useState(0);

  useEffect(() => {
    if (!profile) return;
    supabase.from("opportunities").select("*").eq("status", "verifiee").order("title").then(({ data }) => setOpps((data as Opportunity[]) ?? []));
    supabase.from("portfolio_items").select("*").eq("user_id", profile.id).then(({ data }) => setItems((data as PortfolioItem[]) ?? []));
  }, [profile]);

  if (!profile) return null;
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];
  const oppParam = params.get("o") ?? "";
  const situation: MeetingSituation | undefined = rawMode === "entretien" ? "preparation" : undefined;

  return (
    <div>
      <PageHeader
        title="Assistante"
        subtitle="Elle part de votre profil réel et ne rédige jamais rien que vous n'ayez fait. Relisez et ajustez : c'est votre voix."
        action={<Button variant="secondary" onClick={() => setHistory(true)}>Historique</Button>}
      />

      <Tabs tabs={MODES.map((m) => ({ id: m.id, label: m.label }))} value={current.id} onChange={(m) => { setMode(m); setRestore(null); }} />
      <AnimatePresence mode="wait">
        <motion.p key={current.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 max-w-2xl text-muted">{current.desc}</motion.p>
      </AnimatePresence>

      <div className="mt-6">
        {opps === null ? (
          <div className="grid gap-6 lg:grid-cols-2">{[0, 1].map((i) => <div key={i} className="h-80 animate-pulse rounded-[22px] bg-white ring-1 ring-line" />)}</div>
        ) : (
          <div key={`${current.id}-${instance}`}>
            {current.id === "candidature" && <CandidatureTab opps={opps} items={items} initialOppId={oppParam} restore={restore?.kind === "candidature" ? restore : null} />}
            {current.id === "services" && <ServicesTab items={items} restore={restore?.kind === "services" ? restore : null} />}
            {current.id === "rendezvous" && <RendezvousTab opps={opps} initialOppId={oppParam} initialSituation={situation} restore={restore?.kind === "rendezvous" ? restore : null} />}
          </div>
        )}
      </div>

      <HistoryPanel
        open={history}
        onClose={() => setHistory(false)}
        initialKind={current.id}
        userId={profile.id}
        onOpen={(d) => { setMode(d.kind); setRestore(d); setInstance((n) => n + 1); }}
      />
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense>
      <AssistantInner />
    </Suspense>
  );
}
