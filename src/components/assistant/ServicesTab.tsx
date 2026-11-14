"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Button, Input, Segmented, Select, Textarea } from "@/components/ui";
import { VoiceButton, appendText } from "@/components/VoiceInput";
import { callAi } from "@/lib/ai-client";
import type { AssistantDraft, ClientType, CoherenceCheck, Lang, PortfolioItem, ServiceStyle, Tone } from "@/lib/types";
import { LANG_OPTIONS, Steps, TONE_OPTIONS } from "./CandidatureTab";
import { ResultPanel } from "./ResultPanel";
import { useDraft } from "./useDraft";

type Params = { service: string; clientType: ClientType; sector: string; need: string; style: ServiceStyle; tone: Tone; lang: Lang; extra: string };
const OTHER = "__autre__";

export function ServicesTab({ items, restore }: { items: PortfolioItem[]; restore: AssistantDraft | null }) {
  const { profile } = useAuth();
  const toast = useToast();
  const draft = useDraft("services", profile?.id);
  const [p, setP] = useState<Params>({ service: "", clientType: "particulier", sector: "", need: "", style: "whatsapp", tone: "naturel", lang: "fr", extra: "" });
  const [choice, setChoice] = useState("");
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [checks, setChecks] = useState<CoherenceCheck | null>(null);
  const [source, setSource] = useState<"ia" | "local" | null>(null);
  const [busy, setBusy] = useState(false);

  // Services proposables : activités suggérées + compétences du profil (sans ressaisie).
  const offers = useMemo(() => {
    const s = new Set<string>();
    profile?.suggestions.forEach((x) => s.add(x.title));
    profile?.skills.forEach((x) => s.add(x.name));
    return [...s];
  }, [profile]);

  useEffect(() => {
    if (!restore) return;
    const rp = restore.params as Partial<Params> & { suggestions?: string[] };
    setP((x) => ({ ...x, ...rp }));
    setChoice(rp.service && offers.includes(rp.service) ? rp.service : rp.service ? OTHER : "");
    setText(restore.content);
    setSuggestions(rp.suggestions ?? []);
    setChecks(restore.checks);
    setSource("ia");
    draft.attach(restore.id);
  }, [restore]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Params>(k: K, v: Params[K]) => setP((x) => ({ ...x, [k]: v }));

  // Conseils calculés à partir des données réelles du profil
  const related = items.filter((i) => p.service && `${i.title} ${i.description} ${i.category}`.toLowerCase().includes(p.service.toLowerCase().split(" ")[0]));
  const localTips = [
    !items.length && "Ajoutez des photos de vos réalisations à votre portfolio : un client achète ce qu'il voit.",
    items.length > 0 && p.service && !related.length && `Aucune réalisation de votre portfolio ne montre « ${p.service} » : ajoutez-en une.`,
    !/fcfa|prix|tarif|€|\d/.test(p.extra.toLowerCase()) && "Indiquez un tarif ou une fourchette de prix : le client vous contactera plus facilement.",
    !profile?.city && "Renseignez votre ville dans votre profil pour rassurer les clients proches.",
  ].filter(Boolean) as string[];
  const missing = [!p.service.trim() && "le service à proposer", !p.need.trim() && "le besoin du client (facultatif mais conseillé)"].filter(Boolean) as string[];

  async function generate(again = false) {
    setBusy(true);
    try {
      const r = await callAi<{ text: string; suggestions: string[]; checks: CoherenceCheck | null }>({ kind: "services", ...p, previous: again ? text : "" });
      setText(r.text);
      setSuggestions(r.suggestions ?? []);
      setChecks(r.checks);
      setSource(r.source);
      draft.create({ title: `${p.service} — ${p.clientType}${p.sector ? `, ${p.sector}` : ""}`, opportunity_id: null, params: { ...p, suggestions: r.suggestions ?? [] }, analysis: null, content: r.text, checks: r.checks });
    } catch (e) {
      toast((e as Error).message, "error");
    }
    setBusy(false);
  }

  return (
    <div>
      <Steps current={text ? 4 : busy ? 3 : p.service ? 2 : 1} labels={["Service", "Client et besoin", "Rédaction", "Relecture"]} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start">
        <div className="space-y-4 rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6">
          <Select label="Service à proposer" value={choice} onChange={(e) => { setChoice(e.target.value); set("service", e.target.value === OTHER ? "" : e.target.value); }}>
            <option value="">Choisir un service</option>
            {offers.map((o) => <option key={o} value={o}>{o}</option>)}
            <option value={OTHER}>Autre service…</option>
          </Select>
          {choice === OTHER && <Input label="Décrivez le service" placeholder="Ex. : tresses à domicile" value={p.service} onChange={(e) => set("service", e.target.value)} />}
          {offers.length === 0 && <p className="text-sm text-muted">Aucun service tiré de votre profil. <Link href="/app/decouverte" className="font-semibold text-plum underline">Faites la découverte</Link> ou choisissez « Autre service ».</p>}

          <Segmented<ClientType> label="Client ciblé" size="sm" value={p.clientType} onChange={(v) => set("clientType", v)} options={[{ id: "particulier", label: "Particulier" }, { id: "commerce", label: "Commerce" }, { id: "entreprise", label: "Entreprise" }, { id: "association", label: "Association / ONG" }]} />
          <Input label="Secteur d'activité du client" placeholder="Restauration, mariage, école…" value={p.sector} onChange={(e) => set("sector", e.target.value)} />
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-ink">Besoin du client</span>
              <VoiceButton onText={(t) => set("need", appendText(p.need, t))} lang={p.lang} />
            </div>
            <Textarea aria-label="Besoin du client" rows={3} placeholder="Ex. : le restaurant publie peu sur Facebook et veut plus de clients le midi." value={p.need} onChange={(e) => set("need", e.target.value)} />
          </div>
          <Segmented<ServiceStyle> label="Présentation" size="sm" value={p.style} onChange={(v) => set("style", v)} options={[{ id: "whatsapp", label: "Message WhatsApp" }, { id: "proposition", label: "Proposition commerciale" }, { id: "publication", label: "Publication" }]} />
          <Segmented<Tone> label="Ton" size="sm" value={p.tone} onChange={(v) => set("tone", v)} options={TONE_OPTIONS} />
          <Segmented<Lang> label="Langue" size="sm" value={p.lang} onChange={(v) => set("lang", v)} options={LANG_OPTIONS} />
          <Textarea label="Tarifs, zone, délais (facultatif)" rows={2} placeholder="Ex. : 5 000 FCFA la séance, je me déplace à Lomé." value={p.extra} onChange={(e) => set("extra", e.target.value)} />
          {missing.length > 0 && <p className="text-sm text-muted">À renseigner : {missing.join(", ")}.</p>}
          <Button variant="accent" className="w-full py-4 text-base" loading={busy} disabled={!p.service.trim()} onClick={() => generate(false)}>{text ? "Rédiger une nouvelle version" : "Rédiger ma proposition"}</Button>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6">
          <ResultPanel
            text={text}
            setText={(t) => { setText(t); draft.update({ content: t }); }}
            source={source}
            checks={checks}
            tips={[...suggestions, ...localTips].filter((v, i, a) => a.indexOf(v) === i).slice(0, 6)}
            tipsTitle="Pour améliorer la présentation de ce service"
            busy={busy}
            onRegenerate={() => generate(true)}
            channel={p.style === "whatsapp" ? "whatsapp" : p.style === "proposition" ? "email" : undefined}
            pdfTitle={`Proposition — ${p.service || "services"}`}
            pdfMeta={profile?.full_name}
            saveState={draft.state}
            steps={["Lecture de votre profil et de vos réalisations", "Analyse du besoin du client", "Rédaction de la proposition", "Vérification des informations"]}
            emptyText="Choisissez un service et décrivez le client : l'assistante rédige une proposition adaptée à son besoin."
          />
          {!text && localTips.length > 0 && p.service && (
            <div className="rounded-[22px] bg-plum-50/60 p-5 text-sm">
              <p className="font-bold text-plum">Avant de rédiger</p>
              <ul className="mt-2 space-y-1.5 text-ink">{localTips.map((t) => <li key={t}>• {t}</li>)}</ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
