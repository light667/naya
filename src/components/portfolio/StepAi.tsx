"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui";
import { VoiceButton, appendText } from "@/components/VoiceInput";
import { supabase } from "@/lib/supabase";
import { callAi } from "@/lib/ai-client";
import { mediaUrl, videoFrame } from "@/lib/media";
import type { PortfolioMedia } from "@/lib/types";
import type { MediaState } from "./StepMedia";

type Proposal = { title: string; caption: string; description: string; keywords: string[]; category: string; visible?: string[]; questions?: string[] };

/** Étapes 3 et 4 : l'IA analyse chaque photo / vidéo et propose titre, légende, description, mots-clés ; l'utilisatrice relit et valide. */
export function StepAi({ media, setMedia, onNext, onBack }: Pick<MediaState, "media" | "setMedia"> & { onNext: () => void; onBack: () => void }) {
  const toast = useToast();
  const [props, setProps] = useState<Record<string, Proposal>>({});
  const [ctx, setCtx] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [all, setAll] = useState(false);

  async function describe(m: PortfolioMedia) {
    setBusy((b) => ({ ...b, [m.id]: true }));
    try {
      const image = m.kind === "image" ? mediaUrl(m.path) : await videoFrame(mediaUrl(m.path));
      const r = await callAi<Proposal>({ kind: "media_describe", image, mediaKind: m.kind, context: ctx[m.id] ?? "" });
      setProps((p) => ({ ...p, [m.id]: { title: r.title ?? "", caption: r.caption ?? "", description: r.description ?? "", keywords: r.keywords ?? [], category: r.category ?? "", visible: r.visible, questions: r.questions } }));
    } catch (e) {
      toast(`${m.title || "Média"} : ${(e as Error).message}`, "error");
    }
    setBusy((b) => ({ ...b, [m.id]: false }));
  }

  async function describeAll() {
    setAll(true);
    for (const m of media.filter((x) => x.ai_status !== "accepted" && !props[x.id])) await describe(m);
    setAll(false);
  }

  async function accept(m: PortfolioMedia) {
    const p = props[m.id];
    const patch = { title: p.title, caption: p.caption, description: p.description, keywords: p.keywords, category: p.category || m.category, ai_status: "accepted" as const };
    setMedia((l) => l.map((x) => (x.id === m.id ? { ...x, ...patch } : x)));
    setProps((x) => { const n = { ...x }; delete n[m.id]; return n; });
    const { error } = await supabase.from("portfolio_media").update(patch).eq("id", m.id);
    toast(error ? error.message : "Description validée", error ? "error" : "success");
  }

  const edit = (id: string, patch: Partial<Proposal>) => setProps((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  const todo = media.filter((m) => m.ai_status !== "accepted");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white p-5 ring-1 ring-line">
        <div>
          <p className="font-semibold text-ink">{todo.length ? `${todo.length} média${todo.length > 1 ? "s" : ""} à décrire` : "Tous vos médias sont décrits"}</p>
          <p className="text-sm text-muted">L&apos;IA décrit uniquement ce qu&apos;elle voit. Elle ne devine ni le client, ni votre rôle, ni les résultats : ajoutez-les vous-même.</p>
        </div>
        {todo.length > 0 && <Button variant="accent" loading={all} onClick={describeAll}>Tout décrire avec l&apos;IA</Button>}
      </div>

      {media.length === 0 && <p className="text-center text-muted">Importez d&apos;abord des photos ou vidéos à l&apos;étape précédente.</p>}

      <ul className="space-y-4">
        {media.map((m) => {
          const p = props[m.id];
          const url = mediaUrl(m.path);
          return (
            <li key={m.id} className={`grid gap-4 rounded-[24px] bg-white p-4 ring-1 sm:grid-cols-[180px_1fr] sm:p-5 ${p ? "ring-sun" : "ring-line"}`}>
              {m.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
              ) : <video src={`${url}#t=0.5`} preload="metadata" muted playsInline controls className="aspect-square w-full rounded-2xl bg-night object-cover" />}
              <div className="min-w-0">
                {!p ? (
                  <>
                    <p className="font-semibold text-ink">{m.title || "Sans titre"} {m.ai_status === "accepted" && <span className="ml-1 rounded-full bg-sage-50 px-2 py-0.5 text-xs font-semibold text-sage-700">✓ validé</span>}</p>
                    {m.caption && <p className="text-sm text-muted">{m.caption}</p>}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-ink">Contexte (facultatif)</span>
                      <VoiceButton onText={(t) => setCtx((c) => ({ ...c, [m.id]: appendText(c[m.id] ?? "", t) }))} />
                    </div>
                    <textarea value={ctx[m.id] ?? ""} onChange={(e) => setCtx((c) => ({ ...c, [m.id]: e.target.value }))} rows={2} placeholder="Ex. : tenue cousue pour le mariage d'une cliente en mars, j'ai fait le patron et la couture." className="mt-1 w-full rounded-xl border border-line bg-bg p-3 text-sm" aria-label="Contexte du média" />
                    <Button variant={m.ai_status === "accepted" ? "secondary" : "primary"} className="mt-2" loading={busy[m.id]} onClick={() => describe(m)}>{m.ai_status === "accepted" ? "Redécrire" : "Décrire avec l'IA"}</Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-sun-800">Proposition de l&apos;IA, à relire</p>
                    <input aria-label="Titre" value={p.title} onChange={(e) => edit(m.id, { title: e.target.value })} className="w-full rounded-xl border border-line px-3 py-2 font-semibold" />
                    <input aria-label="Légende" value={p.caption} onChange={(e) => edit(m.id, { caption: e.target.value })} className="w-full rounded-xl border border-line px-3 py-2 text-sm" />
                    <textarea aria-label="Description" value={p.description} onChange={(e) => edit(m.id, { description: e.target.value })} rows={3} className="w-full rounded-xl border border-line px-3 py-2 text-sm" />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input aria-label="Mots-clés" value={p.keywords.join(", ")} onChange={(e) => edit(m.id, { keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })} className="rounded-xl border border-line px-3 py-2 text-sm" placeholder="Mots-clés" />
                      <input aria-label="Catégorie" value={p.category} onChange={(e) => edit(m.id, { category: e.target.value })} className="rounded-xl border border-line px-3 py-2 text-sm" placeholder="Catégorie" />
                    </div>
                    {(p.questions?.length ?? 0) > 0 && (
                      <div className="rounded-xl bg-sun-50 p-3 text-sm text-sun-900">
                        <p className="font-semibold">L&apos;IA ne peut pas le deviner :</p>
                        <ul>{p.questions!.map((q) => <li key={q}>• {q}</li>)}</ul>
                        <p className="mt-1">Complétez la description vous-même, ou ajoutez le contexte puis relancez.</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button variant="primary" onClick={() => accept(m)}>Valider</Button>
                      <Button variant="secondary" loading={busy[m.id]} onClick={() => describe(m)}>Autre proposition</Button>
                      <Button variant="ghost" onClick={() => setProps((x) => { const n = { ...x }; delete n[m.id]; return n; })}>Refuser</Button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="ghost" onClick={onBack}>← Médias</Button>
        <Button variant="primary" onClick={onNext}>Étape suivante : aperçu →</Button>
      </div>
    </div>
  );
}
