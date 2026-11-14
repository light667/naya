"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Button, Input, Segmented, Select, Textarea } from "@/components/ui";
import { VoiceButton, appendText } from "@/components/VoiceInput";
import { callAi } from "@/lib/ai-client";
import type { AssistantDraft, Channel, CoherenceCheck, Formality, Lang, MeetingSituation, Opportunity } from "@/lib/types";
import { CHANNEL_OPTIONS, LANG_OPTIONS, Steps } from "./CandidatureTab";
import { ResultPanel } from "./ResultPanel";
import { useDraft } from "./useDraft";

export const SITUATIONS: { id: MeetingSituation; label: string }[] = [
  { id: "rdv_pro", label: "Demander un rendez-vous professionnel" },
  { id: "entretien_apres_candidature", label: "Demander un entretien après ma candidature" },
  { id: "rencontre_commerciale", label: "Proposer une rencontre commerciale" },
  { id: "relance_contact", label: "Relancer après un premier contact" },
  { id: "relance_sans_reponse", label: "Relancer sans réponse" },
  { id: "confirmation", label: "Confirmer un rendez-vous" },
  { id: "report_annulation", label: "Reporter ou annuler un rendez-vous" },
  { id: "preparation", label: "Me préparer au rendez-vous (fiche)" },
];

type Params = { situation: MeetingSituation; opportunityId: string; recipient: string; organization: string; reason: string; date: string; availability: string; formality: Formality; channel: Channel; lang: Lang; extra: string };

const fmtDate = (v: string) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
};

export function RendezvousTab({ opps, initialOppId, initialSituation, restore }: { opps: Opportunity[]; initialOppId: string; initialSituation?: MeetingSituation; restore: AssistantDraft | null }) {
  const { profile } = useAuth();
  const toast = useToast();
  const draft = useDraft("rendezvous", profile?.id);
  const initOpp = opps.find((o) => o.id === initialOppId);
  const [p, setP] = useState<Params>({
    situation: initialSituation ?? "rdv_pro", opportunityId: initialOppId, recipient: "", organization: initOpp?.organization ?? "", reason: initOpp ? `Mission « ${initOpp.title} »` : "",
    date: "", availability: profile?.availability ?? "", formality: "cordial", channel: "email", lang: "fr", extra: "",
  });
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [checks, setChecks] = useState<CoherenceCheck | null>(null);
  const [source, setSource] = useState<"ia" | "local" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initOpp && !p.organization) setP((x) => ({ ...x, organization: initOpp.organization, reason: x.reason || `Mission « ${initOpp.title} »` }));
  }, [initOpp]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!restore) return;
    const rp = restore.params as Partial<Params> & { subject?: string };
    setP((x) => ({ ...x, ...rp }));
    setText(restore.content);
    setSubject(rp.subject ?? "");
    setChecks(restore.checks);
    setSource("ia");
    draft.attach(restore.id);
  }, [restore]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Params>(k: K, v: Params[K]) => setP((x) => ({ ...x, [k]: v }));
  const prep = p.situation === "preparation";
  const needsDate = ["confirmation", "report_annulation"].includes(p.situation);
  const hints = [
    !p.recipient && !prep && "le nom du destinataire",
    !p.organization && "l'entreprise ou l'organisation",
    needsDate && !p.date && "la date du rendez-vous concerné",
    p.situation === "report_annulation" && !p.availability && "vos nouvelles disponibilités",
  ].filter(Boolean) as string[];

  async function generate(again = false) {
    setBusy(true);
    try {
      const r = await callAi<{ text: string; subject: string; checks: CoherenceCheck | null }>({ kind: "rendezvous", ...p, date: fmtDate(p.date), opportunityId: p.opportunityId || null, previous: again ? text : "" });
      setText(r.text);
      setSubject(r.subject ?? "");
      setChecks(r.checks);
      setSource(r.source);
      const label = SITUATIONS.find((s) => s.id === p.situation)?.label ?? "Rendez-vous";
      draft.create({ title: `${label}${p.organization ? ` — ${p.organization}` : ""}`, opportunity_id: p.opportunityId || null, params: { ...p, subject: r.subject ?? "" }, analysis: null, content: r.text, checks: r.checks });
    } catch (e) {
      toast((e as Error).message, "error");
    }
    setBusy(false);
  }

  return (
    <div>
      <Steps current={text ? 4 : busy ? 3 : p.organization || p.recipient ? 2 : 1} labels={["Situation", "Contexte", "Rédaction", "Relecture"]} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start">
        <div className="space-y-4 rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
          <Select label="Situation" value={p.situation} onChange={(e) => set("situation", e.target.value as MeetingSituation)}>
            {SITUATIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
          <Select label="Mission liée (facultatif)" value={p.opportunityId} onChange={(e) => { const o = opps.find((x) => x.id === e.target.value); setP((x) => ({ ...x, opportunityId: e.target.value, organization: o?.organization ?? x.organization, reason: o ? `Mission « ${o.title} »` : x.reason })); }}>
            <option value="">Aucune</option>
            {opps.map((o) => <option key={o.id} value={o.id}>{o.title}, {o.organization}</option>)}
          </Select>
          <div className="grid gap-3 sm:grid-cols-2">
            {!prep && <Input label="Nom du destinataire" placeholder="Mme Adjo" value={p.recipient} onChange={(e) => set("recipient", e.target.value)} />}
            <Input label="Entreprise ou organisation" placeholder="Togo Digital Hub" value={p.organization} onChange={(e) => set("organization", e.target.value)} />
          </div>
          <Input label="Motif du rendez-vous" placeholder="Présenter mon offre de traiteur" value={p.reason} onChange={(e) => set("reason", e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label={needsDate ? "Date du rendez-vous" : "Date souhaitée"} type="datetime-local" value={p.date} onChange={(e) => set("date", e.target.value)} />
            <Input label="Mes disponibilités" placeholder="Mardi et jeudi après-midi" value={p.availability} onChange={(e) => set("availability", e.target.value)} />
          </div>
          {!prep && (
            <>
              <Segmented<Formality> label="Niveau de formalité" size="sm" value={p.formality} onChange={(v) => set("formality", v)} options={[{ id: "formel", label: "Formel" }, { id: "cordial", label: "Cordial" }, { id: "simple", label: "Simple" }]} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Segmented<Channel> label="Canal" size="sm" value={p.channel} onChange={(v) => set("channel", v)} options={CHANNEL_OPTIONS} />
                <Segmented<Lang> label="Langue" size="sm" value={p.lang} onChange={(v) => set("lang", v)} options={LANG_OPTIONS} />
              </div>
            </>
          )}
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">Informations complémentaires</span>
              <VoiceButton onText={(t) => set("extra", appendText(p.extra, t))} lang={p.lang} />
            </div>
            <Textarea aria-label="Informations complémentaires" rows={2} placeholder="Ex. : nous nous sommes parlé au salon de l'emploi samedi." value={p.extra} onChange={(e) => set("extra", e.target.value)} />
          </div>
          {hints.length > 0 && <p className="text-sm text-muted">Pour un message plus précis, ajoutez : {hints.join(", ")}.</p>}
          <Button variant="accent" className="w-full py-4 text-base" loading={busy} onClick={() => generate(false)}>{prep ? "Préparer ma fiche" : text ? "Rédiger une nouvelle version" : "Rédiger mon message"}</Button>
        </div>

        <div className="lg:sticky lg:top-6">
          <ResultPanel
            text={text}
            setText={(t) => { setText(t); draft.update({ content: t }); }}
            subject={prep ? undefined : subject}
            setSubject={prep ? undefined : setSubject}
            source={source}
            checks={checks}
            busy={busy}
            onRegenerate={() => generate(true)}
            channel={prep ? undefined : p.channel}
            pdfTitle={prep ? "Préparation du rendez-vous" : "Message de rendez-vous"}
            pdfMeta={[profile?.full_name, p.organization].filter(Boolean).join(" · ")}
            saveState={draft.state}
            steps={["Lecture du contexte", prep ? "Préparation des questions" : "Rédaction du message", "Vérification des informations"]}
            emptyText="Choisissez la situation et le destinataire : l'assistante rédige un message adapté au contexte."
          />
        </div>
      </div>
    </div>
  );
}
