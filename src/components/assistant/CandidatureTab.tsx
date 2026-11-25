"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Badge, Button, Input, ScoreRing, Segmented, Select, Textarea } from "@/components/ui";
import { VoiceButton, appendText } from "@/components/VoiceInput";
import { supabase } from "@/lib/supabase";
import { callAi } from "@/lib/ai-client";
import { computeCompatibility } from "@/lib/compat";
import { rankOpportunities } from "@/lib/matching";
import type { AssistantDraft, CandidatureFormat, Channel, CoherenceCheck, Compatibility, Lang, Opportunity, PortfolioItem, Profile, Tone } from "@/lib/types";
import { CompatPanel } from "./CompatPanel";
import { ResultPanel } from "./ResultPanel";
import { useDraft } from "./useDraft";

export const TONE_OPTIONS: { id: Tone; label: string }[] = [
  { id: "professionnel", label: "Professionnel" },
  { id: "naturel", label: "Naturel" },
  { id: "direct", label: "Direct" },
  { id: "convaincant", label: "Convaincant" },
];
export const LANG_OPTIONS: { id: Lang; label: string }[] = [{ id: "fr", label: "Français" }, { id: "en", label: "English" }];
export const CHANNEL_OPTIONS: { id: Channel; label: string }[] = [{ id: "email", label: "E-mail" }, { id: "whatsapp", label: "WhatsApp" }];

type Params = { format: CandidatureFormat; tone: Tone; lang: Lang; channel: Channel; extra: string; organization: string; domain: string };

export function CandidatureTab({ opps, items, initialOppId, restore }: { opps: Opportunity[]; items: PortfolioItem[]; initialOppId: string; restore: AssistantDraft | null }) {
  const { profile, setProfile } = useAuth();
  const toast = useToast();
  const draft = useDraft("candidature", profile?.id);
  const [oppId, setOppId] = useState(initialOppId);
  const [p, setP] = useState<Params>({ format: "court", tone: "professionnel", lang: "fr", channel: "email", extra: "", organization: "", domain: "" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [advice, setAdvice] = useState<string[]>([]);
  const [checks, setChecks] = useState<CoherenceCheck | null>(null);
  const [source, setSource] = useState<"ia" | "local" | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [snapshot, setSnapshot] = useState<Compatibility | null>(null);

  const opp = opps.find((o) => o.id === oppId) ?? null;
  // Étapes 1 à 6 : profil + mission → analyse et score, recalculés à chaque modification du profil.
  const analysis = useMemo(() => (profile && opp ? computeCompatibility(profile, opp, items) : null), [profile, opp, items]);
  const best = useMemo(() => (profile ? rankOpportunities(profile, opps, items).filter((m) => m.complete).slice(0, 3) : []), [profile, opps, items]);

  // Restauration d'un brouillon depuis l'historique
  useEffect(() => {
    if (!restore) return;
    const rp = restore.params as Partial<Params> & { subject?: string; advice?: string[] };
    setOppId(restore.opportunity_id ?? "");
    setP((x) => ({ ...x, ...rp }));
    setText(restore.content);
    setSubject(rp.subject ?? "");
    setAdvice(rp.advice ?? []);
    setChecks(restore.checks);
    setSnapshot(restore.analysis);
    setSource("ia");
    draft.attach(restore.id);
  }, [restore]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Params>(k: K, v: Params[K]) => setP((x) => ({ ...x, [k]: v }));
  const needsOpp = p.format !== "spontanee";
  const canGenerate = needsOpp ? !!opp : !!(opp || p.organization.trim());

  async function generate(again = false) {
    setBusy(true);
    setSent(false);
    try {
      const qa = (analysis?.questions ?? []).map((q) => ({ question: q.question, answer: answers[q.id] ?? "" }));
      const r = await callAi<{ text: string; subject: string; advice: string[]; analysis: Compatibility | null; checks: CoherenceCheck | null }>({
        kind: "candidature", opportunityId: opp?.id ?? null, ...p, answers: qa, previous: again ? text : "",
      });
      setText(r.text);
      setSubject(r.subject);
      setAdvice([...(r.advice ?? []), ...(r.source === "local" ? analysis?.tips ?? [] : [])]);
      setChecks(r.checks);
      setSource(r.source);
      setSnapshot(r.analysis);
      draft.create({
        title: opp ? `${opp.title} — ${opp.organization}` : `Candidature spontanée — ${p.organization}`,
        opportunity_id: opp?.id ?? null,
        params: { ...p, subject: r.subject, advice: r.advice ?? [] },
        analysis: r.analysis,
        content: r.text,
        checks: r.checks,
      });
    } catch (e) {
      toast((e as Error).message, "error");
    }
    setBusy(false);
  }

  async function addSkill(name: string) {
    if (!profile) return;
    const skills = [...profile.skills, { name, category: opp?.category ?? "Autre", level: "intermédiaire" as const }];
    const { data, error } = await supabase.from("profiles").update({ skills }).eq("id", profile.id).select().single();
    if (error) return toast(error.message, "error");
    setProfile(data as Profile);
    toast(`« ${name} » ajoutée à vos compétences`);
  }

  async function markSent() {
    if (!opp || !profile) return;
    const message = subject ? `Objet : ${subject}\n\n${text}` : text;
    const { error } = await supabase.from("applications").upsert({ user_id: profile.id, opportunity_id: opp.id, status: "envoyee", message, updated_at: new Date().toISOString() }, { onConflict: "user_id,opportunity_id" });
    if (error) return toast(error.message, "error");
    setSent(true);
    toast("Candidature marquée comme envoyée dans votre suivi");
  }

  const step = text ? 4 : busy ? 3 : opp || (!needsOpp && p.organization) ? 2 : 1;

  return (
    <div>
      <Steps current={step} labels={["Mission", "Analyse", "Rédaction", "Relecture"]} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start">
        <div className="space-y-5">
          <div className="space-y-4 rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
            <Segmented<CandidatureFormat>
              label="Type de candidature"
              value={p.format}
              onChange={(v) => set("format", v)}
              options={[{ id: "court", label: "Message court" }, { id: "lettre", label: "Lettre détaillée" }, { id: "spontanee", label: "Spontanée" }]}
            />
            <Select label={needsOpp ? "Mission visée" : "Mission liée (facultatif)"} value={oppId} onChange={(e) => { setOppId(e.target.value); setAnswers({}); }}>
              <option value="">{needsOpp ? "Choisir une mission" : "Aucune : candidature libre"}</option>
              {opps.map((o) => <option key={o.id} value={o.id}>{o.title}, {o.organization}</option>)}
            </Select>
            {!needsOpp && !opp && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Structure visée" placeholder="Hôtel Sarakawa, ONG…" value={p.organization} onChange={(e) => set("organization", e.target.value)} />
                <Input label="Domaine souhaité" placeholder="Accueil, couture…" value={p.domain} onChange={(e) => set("domain", e.target.value)} />
              </div>
            )}
          </div>

          {opp && <MissionSummary opp={opp} />}

          {!opp && needsOpp && best.length > 0 && (
            <div className="rounded-[22px] bg-white p-5 ring-1 ring-line">
              <p className="text-sm font-bold text-ink">Les missions qui vous correspondent le mieux</p>
              <ul className="mt-3 space-y-2">
                {best.map((m) => {
                  const o = opps.find((x) => x.id === m.opportunityId)!;
                  return (
                    <li key={o.id}>
                      <button type="button" onClick={() => setOppId(o.id)} className="flex w-full items-center gap-3 rounded-2xl p-2 text-left hover:bg-plum-50">
                        <ScoreRing value={m.score} size={42} />
                        <span className="min-w-0"><span className="block truncate font-semibold text-ink">{o.title}</span><span className="block truncate text-xs text-muted">{o.organization}</span></span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {analysis && <CompatPanel analysis={analysis} answers={answers} onAnswer={(id, v) => setAnswers((a) => ({ ...a, [id]: v }))} onAddSkill={addSkill} />}

          <div className="space-y-4 rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
            <Segmented<Tone> label="Ton" size="sm" value={p.tone} onChange={(v) => set("tone", v)} options={TONE_OPTIONS} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Segmented<Channel> label="Canal d'envoi" size="sm" value={p.channel} onChange={(v) => set("channel", v)} options={CHANNEL_OPTIONS} />
              <Segmented<Lang> label="Langue" size="sm" value={p.lang} onChange={(v) => set("lang", v)} options={LANG_OPTIONS} />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">Informations complémentaires</span>
                <VoiceButton onText={(t) => set("extra", appendText(p.extra, t))} lang={p.lang} />
              </div>
              <Textarea aria-label="Informations complémentaires" rows={3} placeholder="Ex. : j'ai cuisiné pour le mariage de ma cousine (60 invités), je peux commencer lundi." value={p.extra} onChange={(e) => set("extra", e.target.value)} />
            </div>
            <Button variant="accent" className="w-full py-4 text-base" loading={busy} disabled={!canGenerate} onClick={() => generate(false)}>
              {text ? "Rédiger une nouvelle version" : "Rédiger ma candidature"}
            </Button>
            {!canGenerate && <p className="text-center text-sm text-muted">{needsOpp ? "Choisissez d'abord la mission visée." : "Indiquez la structure visée ou une mission."}</p>}
            {profile && profile.skills.length === 0 && (
              <p className="text-sm text-muted">Votre profil n&apos;a pas encore de compétences. <Link href="/app/decouverte" className="font-semibold text-plum underline">Révélez-les en 5 questions</Link> pour une candidature plus juste.</p>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-6">
          {snapshot && text && analysis && snapshot.score !== analysis.score && (
            <p className="mb-3 rounded-2xl bg-plum-50 p-3 text-sm text-ink">Votre profil a changé depuis cette version (score {snapshot.score ?? "—"} % → {analysis.score ?? "—"} %). Régénérez pour en tenir compte.</p>
          )}
          <ResultPanel
            text={text}
            setText={(t) => { setText(t); draft.update({ content: t }); }}
            subject={subject}
            setSubject={setSubject}
            source={source}
            checks={checks}
            tips={advice}
            tipsTitle="Conseils pour cette candidature"
            busy={busy}
            onRegenerate={() => generate(true)}
            channel={p.channel}
            pdfTitle={p.format === "lettre" ? "Lettre de motivation" : "Candidature"}
            pdfMeta={[profile?.full_name, opp ? `${opp.title} — ${opp.organization}` : p.organization].filter(Boolean).join(" · ")}
            saveState={draft.state}
            steps={["Lecture de la mission et de votre profil", "Analyse de compatibilité", "Rédaction de la candidature", "Vérification des informations"]}
            emptyText="Choisissez une mission : l'analyse de compatibilité s'affiche, puis l'assistante rédige une candidature adaptée."
          >
            {opp && (
              <Button variant="primary" disabled={sent} onClick={markSent}>{sent ? "Ajoutée au suivi" : "J'ai envoyé ma candidature"}</Button>
            )}
          </ResultPanel>
        </div>
      </div>
    </div>
  );
}

function MissionSummary({ opp }: { opp: Opportunity }) {
  return (
    <section className="rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
      <p className="text-xs font-semibold text-plum">{opp.category}</p>
      <h3 className="mt-1 text-lg font-bold leading-snug text-ink">{opp.title}</h3>
      <p className="text-sm text-muted">{opp.organization} · {opp.remote ? "À distance" : opp.location} · <span className="font-semibold text-plum">{opp.pay || "Rémunération à discuter"}</span></p>
      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink">{opp.description}</p>
      {opp.skills.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{opp.skills.map((s) => <Badge key={s} tone="neutral">{s}</Badge>)}</div>}
    </section>
  );
}

export function Steps({ current, labels }: { current: number; labels: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Étapes">
      {labels.map((l, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "todo";
        return (
          <li key={l} className="flex items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${state === "done" ? "bg-sage text-white" : state === "current" ? "bg-plum text-white" : "bg-white text-muted ring-1 ring-line"}`}>
              {state === "done" ? "✓" : n}
            </span>
            <span className={`text-sm ${state === "current" ? "font-semibold text-ink" : "text-muted"}`}>{l}</span>
            {n < labels.length && <span className="mx-1 hidden h-px w-6 bg-line sm:block" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
