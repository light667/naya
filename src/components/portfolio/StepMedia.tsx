"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Button, Input, Textarea } from "@/components/ui";
import { VoiceButton, appendText } from "@/components/VoiceInput";
import { supabase } from "@/lib/supabase";
import { callAi } from "@/lib/ai-client";
import { ACCEPT, LIMITS, checkFile, mediaUrl, optimizeImage, removeFile, uploadFile } from "@/lib/media";
import type { PortfolioItem, PortfolioMedia } from "@/lib/types";

type Pending = { key: string; file: File; url: string; kind: "image" | "video"; title: string; itemId: string; category: string };

export type MediaState = {
  items: PortfolioItem[];
  setItems: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
  media: PortfolioMedia[];
  setMedia: React.Dispatch<React.SetStateAction<PortfolioMedia[]>>;
};

/** Étape 2 : projets et importation de photos / vidéos (plusieurs à la fois, aperçu avant validation). */
export function StepMedia({ items, setItems, media, setMedia, onNext, onBack }: MediaState & { onNext: () => void; onBack: () => void }) {
  const { profile } = useAuth();
  const toast = useToast();
  const [pending, setPending] = useState<Pending[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [editing, setEditing] = useState<PortfolioItem | "new" | null>(null);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => pending.forEach((p) => URL.revokeObjectURL(p.url)), []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!profile) return null;

  function add(files: FileList | File[]) {
    const next: Pending[] = [];
    for (const f of Array.from(files)) {
      const c = checkFile(f);
      if ("error" in c) { toast(c.error, "error"); continue; }
      next.push({ key: `${f.name}-${f.size}-${Math.random()}`, file: f, url: URL.createObjectURL(f), kind: c.kind, title: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), itemId: "", category: "" });
    }
    setPending((p) => [...p, ...next]);
  }
  const patchPending = (key: string, patch: Partial<Pending>) => setPending((l) => l.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  const dropPending = (key: string) => setPending((l) => { const p = l.find((x) => x.key === key); if (p) URL.revokeObjectURL(p.url); return l.filter((x) => x.key !== key); });

  async function uploadAll() {
    setProgress({ done: 0, total: pending.length });
    const saved: PortfolioMedia[] = [];
    const okKeys = new Set<string>();
    for (const [i, p] of pending.entries()) {
      try {
        const blob = p.kind === "image" ? await optimizeImage(p.file) : p.file;
        const path = await uploadFile(profile!.id, blob, p.file.name);
        const { data, error } = await supabase.from("portfolio_media").insert({
          user_id: profile!.id, item_id: p.itemId || null, path, kind: p.kind, mime: blob.type, size_bytes: blob.size,
          title: p.title.trim(), category: p.category.trim(), position: media.length + i,
        }).select().single();
        if (error) { await removeFile(path); throw new Error(error.message); }
        saved.push(data as PortfolioMedia);
        okKeys.add(p.key);
        URL.revokeObjectURL(p.url);
      } catch (e) {
        toast(`${p.file.name} : ${(e as Error).message}`, "error");
      }
      setProgress({ done: i + 1, total: pending.length });
    }
    setMedia((m) => [...m, ...saved]);
    setPending((l) => l.filter((p) => !okKeys.has(p.key)));
    setProgress(null);
    if (saved.length) toast(`${saved.length} fichier${saved.length > 1 ? "s" : ""} importé${saved.length > 1 ? "s" : ""}`);
  }

  async function updateMedia(id: string, patch: Partial<PortfolioMedia>) {
    setMedia((l) => l.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    const { error } = await supabase.from("portfolio_media").update(patch).eq("id", id);
    if (error) toast(error.message, "error");
  }

  async function deleteMedia(m: PortfolioMedia) {
    setMedia((l) => l.filter((x) => x.id !== m.id));
    const { error } = await supabase.from("portfolio_media").delete().eq("id", m.id);
    if (error) return toast(error.message, "error");
    await removeFile(m.path);
    toast("Média supprimé");
  }

  async function replaceMedia(m: PortfolioMedia, f: File) {
    const c = checkFile(f);
    if ("error" in c) return toast(c.error, "error");
    try {
      const blob = c.kind === "image" ? await optimizeImage(f) : f;
      const path = await uploadFile(profile!.id, blob, f.name);
      await updateMedia(m.id, { path, kind: c.kind, mime: blob.type, size_bytes: blob.size, ai_status: "none" });
      await removeFile(m.path);
      toast("Fichier remplacé");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  const groups = [...items.map((i) => ({ id: i.id, title: i.title })), { id: "", title: "Sans projet" }];

  return (
    <div className="space-y-8">
      {/* Projets */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-[24px] text-plum">Projets et réalisations</h3>
            <p className="text-sm text-muted">Regroupez vos photos par projet : une tenue, un événement, une boutique…</p>
          </div>
          <Button variant="secondary" onClick={() => setEditing("new")}>+ Nouveau projet</Button>
        </div>
        <AnimatePresence>{editing && <ProjectEditor key={editing === "new" ? "new" : editing.id} item={editing === "new" ? null : editing} media={media} onClose={() => setEditing(null)} onSaved={(it) => { setItems((l) => [it, ...l.filter((x) => x.id !== it.id)]); setEditing(null); }} />}</AnimatePresence>
        {items.length > 0 && (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {items.map((i) => {
              const cover = media.find((m) => m.item_id === i.id && m.kind === "image");
              return (
                <li key={i.id} className="flex gap-3 rounded-[20px] bg-white p-3 ring-1 ring-line">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(cover.path)} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" loading="lazy" />
                  ) : <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-plum-50 text-2xl text-plum/40">▣</span>}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{i.title}</p>
                    <p className="line-clamp-2 text-[13px] text-muted">{i.description || "Pas encore de description"}</p>
                    <div className="mt-1 flex gap-3 text-[13px]">
                      <button onClick={() => setEditing(i)} className="font-semibold text-plum hover:underline">Modifier</button>
                      <span className="text-muted">{media.filter((m) => m.item_id === i.id).length} média(s)</span>
                      <button onClick={async () => { setItems((l) => l.filter((x) => x.id !== i.id)); setMedia((l) => l.map((m) => (m.item_id === i.id ? { ...m, item_id: null } : m))); await supabase.from("portfolio_items").delete().eq("id", i.id); toast("Projet supprimé (ses médias sont conservés)"); }} className="ml-auto text-muted hover:text-red-700">Supprimer</button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Import */}
      <section>
        <h3 className="font-display text-[24px] text-plum">Photos et vidéos</h3>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
          className={`mt-3 flex flex-col items-center rounded-[24px] border-2 border-dashed p-8 text-center transition-colors ${drag ? "border-plum bg-plum-50" : "border-plum/25 bg-white"}`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sun-50 text-2xl text-sun-800" aria-hidden>⤒</span>
          <p className="mt-3 font-semibold text-ink">Importez depuis votre téléphone ou votre ordinateur</p>
          <p className="mt-1 text-sm text-muted">Plusieurs fichiers à la fois · Photos JPG, PNG, WebP ({LIMITS.image.maxMb} Mo max) · Vidéos MP4, MOV, WebM ({LIMITS.video.maxMb} Mo max)</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="accent" onClick={() => input.current?.click()}>Choisir des fichiers</Button>
          </div>
          <input ref={input} type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ""; }} />
        </div>

        {pending.length > 0 && (
          <div className="mt-4 rounded-[24px] bg-white p-4 ring-1 ring-plum/25 sm:p-5">
            <p className="font-semibold text-ink">À valider ({pending.length})</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pending.map((p) => (
                <li key={p.key} className="overflow-hidden rounded-2xl bg-bg ring-1 ring-line">
                  {p.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.url} alt="" className="aspect-[4/3] w-full object-cover" />
                  ) : <video src={p.url} className="aspect-[4/3] w-full bg-night object-cover" muted playsInline controls preload="metadata" />}
                  <div className="space-y-2 p-3">
                    <input aria-label="Titre" value={p.title} onChange={(e) => patchPending(p.key, { title: e.target.value })} className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" placeholder="Titre" />
                    <div className="flex gap-2">
                      <select aria-label="Projet" value={p.itemId} onChange={(e) => patchPending(p.key, { itemId: e.target.value })} className="min-w-0 flex-1 rounded-xl border border-line bg-white px-2 py-2 text-sm">
                        <option value="">Sans projet</option>
                        {items.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
                      </select>
                      <input aria-label="Catégorie" value={p.category} onChange={(e) => patchPending(p.key, { category: e.target.value })} className="w-28 rounded-xl border border-line bg-white px-2 py-2 text-sm" placeholder="Catégorie" />
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-muted">{(p.file.size / 1024 / 1024).toFixed(1)} Mo</span>
                      <button onClick={() => dropPending(p.key)} className="font-semibold text-red-700 hover:underline">Retirer</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              {progress && <span className="text-sm text-muted">Envoi {progress.done}/{progress.total}…</span>}
              <Button variant="ghost" disabled={!!progress} onClick={() => { pending.forEach((p) => URL.revokeObjectURL(p.url)); setPending([]); }}>Tout annuler</Button>
              <Button variant="primary" loading={!!progress} onClick={uploadAll}>Valider et importer</Button>
            </div>
          </div>
        )}
      </section>

      {/* Médias importés */}
      {media.length > 0 && (
        <section>
          {groups.map((g) => {
            const list = media.filter((m) => (m.item_id ?? "") === g.id);
            if (!list.length) return null;
            return (
              <div key={g.id || "none"} className="mb-6">
                <p className="mb-2 text-sm font-bold text-muted">{g.title}</p>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {list.map((m) => <MediaCard key={m.id} m={m} items={items} onChange={(patch) => updateMedia(m.id, patch)} onDelete={() => deleteMedia(m)} onReplace={(f) => replaceMedia(m, f)} />)}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="ghost" onClick={onBack}>← Présentation</Button>
        <Button variant="primary" disabled={pending.length > 0} onClick={onNext}>Étape suivante : descriptions IA →</Button>
      </div>
    </div>
  );
}

function MediaCard({ m, items, onChange, onDelete, onReplace }: { m: PortfolioMedia; items: PortfolioItem[]; onChange: (p: Partial<PortfolioMedia>) => void; onDelete: () => void; onReplace: (f: File) => void }) {
  const [open, setOpen] = useState(false);
  const url = mediaUrl(m.path);
  return (
    <li className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
      <div className="relative">
        {m.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={m.caption || m.title} loading="lazy" className="aspect-square w-full object-cover" />
        ) : <video src={`${url}#t=0.5`} preload="metadata" muted playsInline className="aspect-square w-full bg-night object-cover" />}
        {m.kind === "video" && <span className="absolute left-2 top-2 rounded-full bg-night/70 px-2 py-0.5 text-[11px] font-semibold text-white">Vidéo</span>}
        {m.ai_status === "accepted" && <span className="absolute right-2 top-2 rounded-full bg-sage px-2 py-0.5 text-[11px] font-semibold text-white">Décrit</span>}
      </div>
      <div className="p-2.5">
        <p className="truncate text-sm font-semibold text-ink">{m.title || "Sans titre"}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 text-[12px]">
          <button onClick={() => setOpen(!open)} className="font-semibold text-plum">{open ? "Fermer" : "Modifier"}</button>
          <label className="cursor-pointer font-semibold text-muted hover:text-plum">Remplacer<input type="file" accept={ACCEPT} className="sr-only" onChange={(e) => e.target.files?.[0] && onReplace(e.target.files[0])} /></label>
          <button onClick={onDelete} className="text-muted hover:text-red-700">Supprimer</button>
        </div>
        {open && (
          <div className="mt-2 space-y-2">
            <input aria-label="Titre" defaultValue={m.title} onBlur={(e) => e.target.value !== m.title && onChange({ title: e.target.value })} className="w-full rounded-lg border border-line px-2 py-1.5 text-sm" placeholder="Titre" />
            <textarea aria-label="Légende" defaultValue={m.caption} onBlur={(e) => e.target.value !== m.caption && onChange({ caption: e.target.value })} rows={2} className="w-full rounded-lg border border-line px-2 py-1.5 text-sm" placeholder="Légende" />
            <select aria-label="Projet" value={m.item_id ?? ""} onChange={(e) => onChange({ item_id: e.target.value || null })} className="w-full rounded-lg border border-line px-2 py-1.5 text-sm">
              <option value="">Sans projet</option>
              {items.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
            </select>
            <input aria-label="Catégorie" defaultValue={m.category} onBlur={(e) => e.target.value !== m.category && onChange({ category: e.target.value })} className="w-full rounded-lg border border-line px-2 py-1.5 text-sm" placeholder="Catégorie" />
          </div>
        )}
      </div>
    </li>
  );
}

/** Fiche projet : saisie (écrite ou dictée) + rédaction assistée par l'IA, sans rien inventer. */
function ProjectEditor({ item, media, onClose, onSaved }: { item: PortfolioItem | null; media: PortfolioMedia[]; onClose: () => void; onSaved: (i: PortfolioItem) => void }) {
  const { profile } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({
    title: item?.title ?? "", category: item?.category ?? "", description: item?.description ?? "", goals: item?.goals ?? "",
    role: item?.role ?? "", tools: (item?.tools ?? []).join(", "), results: item?.results ?? "", link: item?.link ?? "",
  });
  const [notes, setNotes] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  async function draft() {
    setBusy(true);
    try {
      const r = await callAi<{ title?: string; description?: string; goals?: string; role?: string; tools?: string[]; results?: string; category?: string; questions?: string[] }>({
        kind: "project_describe", notes, item: { ...f, tools: f.tools.split(",").map((t) => t.trim()).filter(Boolean) },
        mediaCaptions: item ? media.filter((m) => m.item_id === item.id).map((m) => m.caption || m.title).filter(Boolean) : [],
      });
      setF((x) => ({
        ...x,
        title: x.title || r.title || "", category: x.category || r.category || "",
        description: r.description || x.description, goals: r.goals || x.goals, role: r.role || x.role,
        tools: r.tools?.length ? r.tools.join(", ") : x.tools, results: r.results || x.results,
      }));
      setQuestions(r.questions ?? []);
      toast("Proposition insérée : relisez et modifiez librement");
    } catch (e) {
      toast((e as Error).message, "error");
    }
    setBusy(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const raw = f.link.trim();
    const row = {
      title: f.title.trim(), category: f.category.trim(), description: f.description.trim(), goals: f.goals.trim(), role: f.role.trim(), results: f.results.trim(),
      tools: f.tools.split(",").map((t) => t.trim()).filter(Boolean), link: raw && !/^https?:\/\//.test(raw) ? `https://${raw}` : raw, updated_at: new Date().toISOString(),
    };
    const q = item ? supabase.from("portfolio_items").update(row).eq("id", item.id) : supabase.from("portfolio_items").insert({ ...row, user_id: profile!.id });
    const { data, error } = await q.select().single();
    setSaving(false);
    if (error) return toast(error.message.includes("column") ? "Exécutez la migration 002 dans Supabase." : error.message, "error");
    onSaved(data as PortfolioItem);
    toast(item ? "Projet mis à jour" : "Projet ajouté");
  }

  return (
    <motion.form onSubmit={save} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="mt-4 space-y-4 rounded-[24px] bg-white p-5 ring-1 ring-plum/30 sm:p-6">
        <div className="rounded-2xl bg-plum-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">Racontez ce projet (écrit ou dicté)</p>
            <VoiceButton onText={(t) => setNotes((n) => appendText(n, t))} label="Parler" />
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Pour qui, ce que vous avez fait, avec quoi, le résultat…" className="mt-2 w-full rounded-xl border border-line bg-white p-3 text-[15px]" aria-label="Notes sur le projet" />
          <div className="mt-2 flex justify-end"><Button type="button" variant="primary" loading={busy} disabled={!notes.trim() && !f.title.trim()} onClick={draft}>Rédiger la fiche avec l&apos;IA</Button></div>
          {questions.length > 0 && <ul className="mt-2 space-y-0.5 text-sm text-sun-900">{questions.map((q) => <li key={q}>• {q}</li>)}</ul>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Titre du projet" required value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Robe de mariée en pagne wax" />
          <Input label="Catégorie" value={f.category} onChange={(e) => set("category", e.target.value)} placeholder="Couture & mode" />
        </div>
        <Textarea label="Description" rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea label="Objectifs" rows={2} value={f.goals} onChange={(e) => set("goals", e.target.value)} />
          <Textarea label="Mon rôle et mes contributions" rows={2} value={f.role} onChange={(e) => set("role", e.target.value)} />
          <Input label="Outils ou technologies" hint="Séparés par des virgules" value={f.tools} onChange={(e) => set("tools", e.target.value)} placeholder="Machine à coudre, Canva" />
          <Input label="Lien (GitHub, démo, Instagram…)" value={f.link} onChange={(e) => set("link", e.target.value)} />
        </div>
        <Textarea label="Résultats obtenus (si vous les connaissez)" rows={2} value={f.results} onChange={(e) => set("results", e.target.value)} />
        <div className="flex gap-2">
          <Button type="submit" variant="accent" loading={saving}>{item ? "Enregistrer" : "Ajouter le projet"}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
        </div>
      </div>
    </motion.form>
  );
}

