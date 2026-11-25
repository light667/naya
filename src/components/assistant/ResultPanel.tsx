"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AiBadge, Button } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { printText } from "@/lib/print";
import type { Channel, CoherenceCheck } from "@/lib/types";
import { SaveIndicator, type SaveState } from "./useDraft";

/** Espace de résultat : texte modifiable + copier, régénérer, PDF, envoi par e-mail ou WhatsApp. */
export function ResultPanel({
  text, setText, subject, setSubject, source, checks, tips, tipsTitle = "Suggestions", busy, onRegenerate, channel, pdfTitle, pdfMeta, saveState, emptyText, steps, children,
}: {
  text: string;
  setText: (t: string) => void;
  subject?: string;
  setSubject?: (s: string) => void;
  source: "ia" | "local" | null;
  checks?: CoherenceCheck | null;
  tips?: string[];
  tipsTitle?: string;
  busy: boolean;
  onRegenerate: () => void;
  channel?: Channel;
  pdfTitle: string;
  pdfMeta?: string;
  saveState: SaveState;
  emptyText: string;
  steps?: string[];
  children?: ReactNode;
}) {
  const toast = useToast();
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(text.length);
  const prev = useRef(text);

  // Révélation progressive quand un nouveau texte arrive (pas pendant la saisie).
  useEffect(() => {
    if (busy) return;
    if (text && text !== prev.current && Math.abs(text.length - prev.current.length) > 40 && !reduce) setShown(0);
    else setShown(text.length);
    prev.current = text;
  }, [text, busy, reduce]);
  useEffect(() => {
    if (shown >= text.length) return;
    const t = setTimeout(() => setShown((s) => { const n = text.indexOf(" ", s + 6); return n === -1 ? text.length : n; }), 16);
    return () => clearTimeout(t);
  }, [shown, text]);
  const writing = shown < text.length;

  const full = subject ? `Objet : ${subject}\n\n${text}` : text;

  if (busy) {
    return (
      <div className="rounded-[22px] bg-white p-6 ring-1 ring-plum/15" aria-live="polite">
        <p className="font-display text-xl text-plum">L&apos;assistante travaille…</p>
        <ol className="mt-4 space-y-3">
          {(steps ?? ["Lecture de votre profil", "Rédaction", "Vérification des informations"]).map((s, i) => (
            <motion.li key={s} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }} className="flex items-center gap-3 text-sm text-ink">
              <motion.span animate={{ opacity: [0.35, 1, 0.35] }} transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.3 }} className="h-2.5 w-2.5 rounded-full bg-plum" />
              {s}
            </motion.li>
          ))}
        </ol>
        <div className="mt-6 space-y-2">{[90, 100, 75, 95, 60].map((w, i) => <div key={i} className="h-3 animate-pulse rounded-full bg-plum-50" style={{ width: `${w}%` }} />)}</div>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[22px] border border-dashed border-plum/20 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-plum-50 text-plum"><Icon.spark /></span>
        <p className="mt-4 max-w-xs text-muted">{emptyText}</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[22px] bg-white p-5 ring-1 ring-plum/20 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <AiBadge source={source} />
        {writing ? <span className="text-sm text-muted">Écriture…</span> : <SaveIndicator state={saveState} />}
      </div>

      {checks && (
        <div className={`mb-3 rounded-2xl p-3 text-sm ${checks.ok ? "bg-sage-50 text-sage-700" : "bg-sun-50 text-sun-900"}`}>
          {checks.ok ? (
            <p>✓ Vérifié : le texte ne contient que des informations présentes dans votre profil.</p>
          ) : (
            <>
              <p className="font-semibold">À vérifier avant d&apos;envoyer : ces passages ne sont pas appuyés par votre profil.</p>
              <ul className="mt-1 space-y-0.5">{checks.issues.map((i) => <li key={i}>• {i}</li>)}</ul>
            </>
          )}
        </div>
      )}

      {setSubject && subject !== undefined && channel !== "whatsapp" && (
        <label className="mb-2 block">
          <span className="text-xs font-semibold text-muted">Objet</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-xl border border-transparent bg-bg px-3 py-2 text-[15px] font-semibold focus:border-plum focus:outline-none" />
        </label>
      )}

      {writing ? (
        <div className="min-h-[300px] whitespace-pre-wrap rounded-2xl bg-bg p-4 text-[15px] leading-relaxed text-ink">
          {text.slice(0, shown)}<span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-plum" />
        </div>
      ) : (
        <textarea
          aria-label="Texte proposé, modifiable"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={Math.min(22, Math.max(10, text.split("\n").length + 3))}
          className="w-full resize-y rounded-2xl border border-transparent bg-bg p-4 text-[15px] leading-relaxed focus:border-plum focus:outline-none focus:ring-4 focus:ring-plum/10"
        />
      )}
      <p className="mt-1 text-right text-xs text-muted">{text.trim().split(/\s+/).length} mots · modifiable directement</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" disabled={writing} onClick={async () => { await navigator.clipboard.writeText(full); toast("Texte copié"); }}><Icon.copy /> Copier</Button>
        <Button variant="secondary" disabled={writing} onClick={onRegenerate}>↻ Autre formulation</Button>
        <Button variant="secondary" disabled={writing} onClick={() => { if (!printText(pdfTitle, full, pdfMeta)) toast("Autorisez les fenêtres pour télécharger le PDF.", "error"); }}>⤓ PDF</Button>
        {channel === "whatsapp" ? (
          <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[15px] font-semibold text-[#0b3d1f] hover:brightness-95">Ouvrir dans WhatsApp</a>
        ) : channel === "email" ? (
          <a href={`mailto:?subject=${encodeURIComponent(subject ?? "")}&body=${encodeURIComponent(text)}`} className="inline-flex items-center gap-2 rounded-full bg-plum px-5 py-3 text-[15px] font-semibold text-white hover:bg-plum-700">Ouvrir dans ma messagerie</a>
        ) : null}
        {children}
      </div>

      <AnimatePresence>
        {tips && tips.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 rounded-2xl bg-plum-50/60 p-4">
            <p className="text-sm font-bold text-plum">{tipsTitle}</p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink">{tips.map((t) => <li key={t}>• {t}</li>)}</ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
