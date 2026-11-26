"use client";

import { useEffect, useRef, useState } from "react";
import { transcribeAudio } from "@/lib/ai-client";
import { supabase } from "@/lib/supabase";
import { useToast } from "./Toast";

type SR = {
  lang: string; continuous: boolean; interimResults: boolean;
  start: () => void; stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null;
};

let serverEnabled: boolean | null = null;
async function serverAvailable() {
  if (serverEnabled === null) serverEnabled = await fetch("/api/transcribe").then((r) => r.json()).then((d) => !!d.enabled).catch(() => false);
  return serverEnabled;
}

/**
 * Bouton micro : dicte du texte et l'ajoute au champ.
 * 1) Transcription Mistral Voxtral (enregistrement puis envoi, avec ponctuation) si la clé est configurée ;
 * 2) sinon, reconnaissance vocale du navigateur, en direct.
 */
export function VoiceButton({ onText, lang = "fr", className = "", label = "Dicter", iconOnlyOnMobile }: { onText: (t: string) => void; lang?: string; className?: string; label?: string; iconOnlyOnMobile?: boolean }) {
  const toast = useToast();
  const [state, setState] = useState<"idle" | "rec" | "busy">("idle");
  const [seconds, setSeconds] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const sr = useRef<SR | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (state !== "rec") return;
    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  useEffect(() => () => { rec.current?.stream.getTracks().forEach((t) => t.stop()); sr.current?.stop(); }, []);

  async function start() {
    // La transcription serveur demande un compte : sans connexion, on utilise la reconnaissance du navigateur.
    const signedIn = !!(await supabase.auth.getSession()).data.session;
    if (signedIn && (await serverAvailable())) {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return browserFallback();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t));
        const r = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
        chunks.current = [];
        r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
        r.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          setState("busy");
          try {
            const text = await transcribeAudio(new Blob(chunks.current, { type: r.mimeType }), lang);
            if (text) onText(text);
            else if (text === "") toast("Je n'ai rien entendu. Parle plus près du micro.", "error");
          } catch (e) {
            toast((e as Error).message, "error");
          }
          setState("idle");
        };
        r.start();
        rec.current = r;
        setState("rec");
      } catch {
        toast("Le micro est refusé. Autorise-le dans les réglages du navigateur.", "error");
      }
      return;
    }
    browserFallback();
  }

  function browserFallback() {
    const W = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Ctor) return toast("La saisie vocale ne marche pas sur ce navigateur. Essaie avec Chrome.", "error");
    const r = new Ctor();
    r.lang = lang === "en" ? "en-US" : "fr-FR";
    r.continuous = true;
    r.interimResults = false;
    let buffer = "";
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) buffer += `${e.results[i][0].transcript.trim()} `;
    };
    r.onerror = (e) => { if (e.error !== "no-speech" && e.error !== "aborted") toast("Micro indisponible ou refusé.", "error"); };
    r.onend = () => {
      const t = buffer.trim();
      if (t) onText(t.charAt(0).toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? "" : "."));
      setState("idle");
    };
    r.start();
    sr.current = r;
    setState("rec");
  }

  function stop() {
    if (rec.current?.state === "recording") rec.current.stop();
    rec.current = null;
    sr.current?.stop();
    sr.current = null;
  }

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <button
      type="button"
      onClick={state === "rec" ? stop : start}
      disabled={state === "busy"}
      aria-pressed={state === "rec"}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
        state === "rec" ? "bg-coral text-white" : "bg-white text-ink ring-1 ring-inset ring-line hover:bg-slate-50"
      } ${className}`}
    >
      {state === "rec" ? (
        <><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" /></span><span className={iconOnlyOnMobile ? "sr-only sm:not-sr-only" : ""}>Arrêter · </span>{mmss}</>
      ) : state === "busy" ? (
        <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Transcription…</>
      ) : (
        <><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg><span className={iconOnlyOnMobile ? "sr-only sm:not-sr-only" : ""}>{label}</span></>
      )}
    </button>
  );
}

/** Ajoute un texte dicté à la suite d'un texte existant. */
export const appendText = (current: string, add: string) => (current.trim() ? `${current.trim()}\n${add}` : add);
