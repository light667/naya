"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { AiBadge, Button, PageHeader, Select, Tabs, Textarea } from "@/components/ui";
import { Icon } from "@/components/icons";
import { supabase } from "@/lib/supabase";
import { callAi } from "@/lib/ai-client";
import type { Opportunity, WriteMode } from "@/lib/types";

const MODES: { id: WriteMode; label: string; desc: string; needsOpp: boolean; placeholder: string }[] = [
  { id: "candidature", label: "Candidature", desc: "Un message personnel pour postuler, prêt à envoyer par e-mail ou WhatsApp.", needsOpp: true, placeholder: "Ex. : j'ai déjà fait une mission semblable, je peux commencer lundi." },
  { id: "presentation", label: "Mes services", desc: "Un texte court pour présenter ce que vous proposez sur WhatsApp ou Facebook.", needsOpp: false, placeholder: "Ex. : mes tarifs, mon numéro, livraison possible." },
  { id: "entretien", label: "Rendez-vous", desc: "Une présentation de 30 secondes, les questions probables et des conseils de sécurité.", needsOpp: false, placeholder: "Ex. : le rendez-vous est jeudi au bureau de l'association." },
];

function AssistantInner() {
  const { profile } = useAuth();
  const toast = useToast();
  const reduce = useReducedMotion();
  const params = useSearchParams();
  const [mode, setMode] = useState<WriteMode>((params.get("mode") as WriteMode) || "candidature");
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [oppId, setOppId] = useState(params.get("o") ?? "");
  const [extra, setExtra] = useState("");
  const [text, setText] = useState("");
  const [shown, setShown] = useState(0);
  const [source, setSource] = useState<"ia" | "local" | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("opportunities").select("*").eq("status", "verifiee").order("title").then(({ data }) => setOpps((data as Opportunity[]) ?? []));
  }, []);

  // Révélation progressive du texte, mot par mot
  useEffect(() => {
    if (shown >= text.length) return;
    const t = setTimeout(() => {
      const next = text.indexOf(" ", shown + 1);
      setShown(next === -1 ? text.length : next);
    }, 18);
    return () => clearTimeout(t);
  }, [shown, text]);

  const opp = opps.find((o) => o.id === oppId) ?? null;
  const current = MODES.find((m) => m.id === mode)!;
  const writing = shown < text.length;

  async function generate() {
    setBusy(true);
    setSent(false);
    try {
      const r = await callAi<{ text: string }>({ kind: "write", mode, profile, opportunity: opp, extra });
      setText(r.text);
      setShown(reduce ? r.text.length : 0);
      setSource(r.source);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 50);
    } catch (e) {
      toast((e as Error).message, "error");
    }
    setBusy(false);
  }

  async function markSent() {
    const { error } = await supabase
      .from("applications")
      .upsert({ user_id: profile!.id, opportunity_id: oppId, status: "envoyee", message: text, updated_at: new Date().toISOString() }, { onConflict: "user_id,opportunity_id" });
    if (error) return toast(error.message, "error");
    setSent(true);
    toast("Candidature marquée comme envoyée dans votre suivi");
  }

  return (
    <div>
      <PageHeader title="Assistante" subtitle="Elle écrit un premier jet à partir de votre profil. Relisez et ajustez : c'est votre voix." />

      <Tabs tabs={MODES.map((m) => ({ id: m.id, label: m.label }))} value={mode} onChange={(m) => { setMode(m); setText(""); setShown(0); setSource(null); }} />
      <AnimatePresence mode="wait">
        <motion.p key={mode} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 max-w-xl text-muted">{current.desc}</motion.p>
      </AnimatePresence>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-start">
        <div className="space-y-4 rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
          <Select label={current.needsOpp ? "Mission visée" : "Mission (facultatif)"} value={oppId} onChange={(e) => setOppId(e.target.value)}>
            <option value="">{current.needsOpp ? "Choisir une mission" : "Aucune en particulier"}</option>
            {opps.map((o) => <option key={o.id} value={o.id}>{o.title}, {o.organization}</option>)}
          </Select>
          <Textarea label="Ce que l'assistante doit savoir (facultatif)" rows={3} placeholder={current.placeholder} value={extra} onChange={(e) => setExtra(e.target.value)} />
          <Button variant="accent" className="w-full py-4 text-base" loading={busy} disabled={current.needsOpp && !oppId} onClick={generate}>
            {text ? "Proposer une autre version" : "Lancer l'assistante"}
          </Button>
          {current.needsOpp && !oppId && <p className="text-center text-sm text-muted">Choisissez d&apos;abord la mission visée.</p>}
          {profile && profile.skills.length === 0 && <p className="text-sm text-muted">Le texte sera plus personnel une fois vos compétences révélées.</p>}
        </div>

        <div ref={resultRef} className="scroll-mt-24">
          <AnimatePresence mode="wait">
            {text ? (
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[22px] bg-white p-5 ring-1 ring-plum/20 sm:p-6">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <AiBadge source={source} />
                  {writing && <span className="text-sm text-muted">Écriture…</span>}
                </div>
                {writing ? (
                  <div className="min-h-[320px] whitespace-pre-wrap rounded-2xl bg-bg p-4 text-[15px] leading-relaxed text-ink">
                    {text.slice(0, shown)}
                    <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-plum" />
                  </div>
                ) : (
                  <textarea
                    aria-label="Texte proposé, modifiable"
                    value={text}
                    onChange={(e) => { setText(e.target.value); setShown(e.target.value.length); }}
                    rows={15}
                    className="w-full resize-y rounded-2xl border border-transparent bg-bg p-4 text-[15px] leading-relaxed focus:border-plum focus:outline-none focus:ring-4 focus:ring-plum/10"
                  />
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" disabled={writing} onClick={async () => { await navigator.clipboard.writeText(text); toast("Texte copié"); }}>
                    <Icon.copy /> Copier le texte
                  </Button>
                  {mode === "candidature" && oppId && (
                    <Button variant="primary" disabled={writing || sent} onClick={markSent}>{sent ? "Ajoutée au suivi" : "J'ai envoyé ma candidature"}</Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[320px] flex-col items-center justify-center rounded-[22px] border border-dashed border-plum/20 p-8 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-plum-50 text-plum"><Icon.spark /></span>
                <p className="mt-4 max-w-xs text-muted">Le texte apparaîtra ici. Vous pourrez le modifier avant de l&apos;envoyer.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
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
