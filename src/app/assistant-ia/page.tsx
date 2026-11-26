"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { VoiceButton } from "@/components/VoiceInput";
import { SkillIcon } from "@/components/SkillList";
import { newOnly } from "@/lib/skills";
import { addSkillsToProfile, readPending, writePending } from "@/lib/skills-client";
import type { Skill } from "@/lib/types";

type Message = {
  id: string;
  sender: "ia" | "user";
  text: string;
  /** Réponse du moteur de secours (IA indisponible) */
  local?: boolean;
  /** Échec : le message de l'utilisateur à renvoyer avec « Réessayer » */
  failedFor?: string;
};

const PROMPTS = {
  reveal: { label: "Révéler mes compétences", prompt: "Aide-moi à trouver mes compétences. Pose-moi des questions simples, une à la fois." },
  price: { label: "Calculer mon prix", prompt: "Aide-moi à calculer mon prix pour un travail : le coût de la matière, le temps passé et ma marge. Pose-moi les questions une par une." },
  interview: { label: "Simuler un entretien", prompt: "Simule un entretien d'embauche avec moi, une question à la fois. À la fin, donne-moi une note sur 10 et des conseils." },
  apply: { label: "Écrire mon message pour postuler", prompt: "Aide-moi à écrire un message court pour postuler à une offre, à envoyer sur WhatsApp." },
};

const clean = (text: string) =>
  text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/(^|\s)\*(\S.*?)\*/g, "$1$2")
    .replace(/^#{1,6}\s?/gm, "")
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, "$1")
    .replace(/^\s*•\s*/gm, "- ")
    .trim();

const TIMEOUT_MS = 45_000;

export default function AssistantIaPage() {
  const { session, profile, setProfile } = useAuth();
  const toast = useToast();
  const firstName = (profile?.full_name || "").trim().split(/\s+/)[0];
  const storeKey = `phar_chat_${session?.user.id ?? "invite"}`;
  const profileSkills = useMemo(() => (Array.isArray(profile?.skills) ? profile!.skills : []), [profile]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState<Skill[]>([]); // compétences repérées, pas encore dans le profil
  const [saving, setSaving] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const loaded = useRef<string | null>(null);

  // Historique gardé sur l'appareil, par compte : on reprend la conversation là où on l'a laissée.
  useEffect(() => {
    if (loaded.current === storeKey) return;
    loaded.current = storeKey;
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) || "[]");
      setMessages(Array.isArray(saved) ? saved.filter((m: Message) => !m.failedFor) : []);
    } catch {
      setMessages([]);
    }
    setFound(readPending());
  }, [storeKey]);

  useEffect(() => {
    if (loaded.current !== storeKey) return;
    try {
      localStorage.setItem(storeKey, JSON.stringify(messages.filter((m) => !m.failedFor).slice(-40)));
    } catch {
      /* stockage indisponible */
    }
  }, [messages, storeKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  // Les compétences repérées qui sont déjà dans le profil ne comptent pas comme « nouvelles ».
  const pending = useMemo(() => newOnly(profileSkills, found), [profileSkills, found]);

  const detectSkills = useCallback(
    async (text: string) => {
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
          body: JSON.stringify({ kind: "extract_skills", text, source: "assistant" }),
        });
        const data = await res.json();
        const skills: Skill[] = Array.isArray(data.skills) ? data.skills : [];
        if (!skills.length) return;
        setFound((prev) => {
          const merged = [...prev, ...newOnly(prev, skills)];
          if (!session) writePending(merged);
          return merged;
        });
      } catch {
        /* le repérage est un bonus : on n'interrompt pas la conversation */
      }
    },
    [session],
  );

  async function send(text: string, opts: { retry?: boolean } = {}) {
    const userText = text.trim();
    if (!userText || loading) return;
    setInput("");
    const history = messages.filter((m) => m.text && !m.failedFor).map((m) => ({ role: m.sender === "ia" ? "assistant" : "user", content: m.text }));
    const iaId = `${Date.now()}-ia`;
    setMessages((prev) => [
      ...(opts.retry ? prev.filter((m) => !m.failedFor) : [...prev, { id: `${Date.now()}-u`, sender: "user" as const, text: userText }]),
      { id: iaId, sender: "ia", text: "" },
    ]);
    setLoading(true);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ message: userText, history, userName: firstName || undefined }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error(String(res.status));
      const isLocal = res.headers.get("X-PHAR-Source") === "local";
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const shown = clean(acc);
        setMessages((prev) => prev.map((m) => (m.id === iaId ? { ...m, text: shown, local: isLocal } : m)));
      }
      if (!acc.trim()) throw new Error("vide");
      // Les phrases de démarrage ne racontent rien sur la personne : pas de repérage.
      if (!Object.values(PROMPTS).some((p) => p.prompt === userText)) detectSkills(userText);
    } catch (e) {
      const aborted = (e as Error).name === "AbortError";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === iaId
            ? {
                ...m,
                text: aborted ? "La réponse prend trop de temps. Ta connexion est peut-être lente." : "L'assistant n'a pas pu répondre.",
                failedFor: userText,
              }
            : m,
        ),
      );
    } finally {
      clearTimeout(timer);
      setLoading(false);
    }
  }

  async function saveFound() {
    if (!profile || !pending.length) return;
    setSaving(true);
    try {
      const { profile: next, added } = await addSkillsToProfile(profile, pending);
      setProfile(next);
      setFound([]);
      writePending([]);
      toast(`${added.length} compétence${added.length > 1 ? "s" : ""} ajoutée${added.length > 1 ? "s" : ""} à ton profil`);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  function speak(m: Message) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return toast("La lecture à voix haute n'est pas disponible sur ce téléphone.", "error");
    const synth = window.speechSynthesis;
    if (speakingId === m.id) {
      synth.cancel();
      return setSpeakingId(null);
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(m.text);
    u.lang = "fr-FR";
    u.rate = 0.95;
    u.onend = () => setSpeakingId(null);
    setSpeakingId(m.id);
    synth.speak(u);
  }

  function newConversation() {
    window.speechSynthesis?.cancel();
    setMessages([]);
  }

  // Suggestions selon le profil
  const suggestions = [
    ...(profileSkills.length ? [] : [PROMPTS.reveal]),
    PROMPTS.price,
    PROMPTS.interview,
    PROMPTS.apply,
  ];
  const started = messages.length > 0;

  return (
    <div className="flex min-h-[100svh] flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 sm:px-6">
        {!started ? (
          <section className="pb-8 pt-10 sm:pt-16">
            <h1 className="text-[32px] font-semibold leading-[1.15] text-ink sm:text-4xl">{firstName ? `Bonjour ${firstName}` : "Raconte ce que tu sais faire"}</h1>
            <p className="mt-3 text-lg text-muted">Je suis l&apos;assistant PHAR. Dis-moi ton métier et ce que tu fais chaque jour, je t&apos;aide à le montrer aux employeurs.</p>
            <ul className="mt-8 space-y-2">
              {suggestions.map((sp) => (
                <li key={sp.label}>
                  <button
                    onClick={() => send(sp.prompt)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-white px-4 text-left text-base text-ink ring-1 ring-line transition-colors hover:bg-slate-50"
                  >
                    {sp.label}
                    <span aria-hidden className="text-muted">→</span>
                  </button>
                </li>
              ))}
              {profileSkills.length > 0 && (
                <li>
                  <Link href="/profil" className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-white px-4 text-base text-ink ring-1 ring-line hover:bg-slate-50">
                    Voir ma carte de compétences
                    <span aria-hidden className="text-muted">→</span>
                  </Link>
                </li>
              )}
            </ul>
          </section>
        ) : (
          <div className="flex-1 py-6">
            <div className="flex justify-end">
              <button onClick={newConversation} className="inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4 hover:text-ink">
                Nouvelle conversation
              </button>
            </div>
            <div className="mt-2 space-y-6" aria-live="polite">
              {messages.map((m) =>
                m.sender === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-slate-100 px-4 py-3 text-[17px] leading-relaxed text-ink">{m.text}</p>
                  </div>
                ) : m.failedFor ? (
                  <div key={m.id} role="alert" className="rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
                    <p className="text-base text-red-800">{m.text}</p>
                    <button onClick={() => send(m.failedFor!, { retry: true })} className="mt-2 inline-flex min-h-11 items-center rounded-lg bg-white px-4 text-sm font-semibold text-ink ring-1 ring-line hover:bg-slate-50">
                      Réessayer
                    </button>
                  </div>
                ) : (
                  <div key={m.id}>
                    {m.text ? (
                      <>
                        <p className="whitespace-pre-line text-[17px] leading-relaxed text-ink">{m.text}</p>
                        <div className="mt-1 flex items-center gap-3">
                          <button onClick={() => speak(m)} className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ink" aria-pressed={speakingId === m.id}>
                            {speakingId === m.id ? "Arrêter la lecture" : "Écouter"}
                          </button>
                          {m.local && <span className="text-xs text-muted">Réponse simplifiée : l&apos;assistant est très demandé en ce moment</span>}
                        </div>
                      </>
                    ) : (
                      <p className="flex items-center gap-2 text-sm text-muted">
                        <span className="flex gap-1" aria-hidden>
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.3s]" />
                        </span>
                        L&apos;assistant écrit…
                      </p>
                    )}
                  </div>
                ),
              )}
              <div ref={endRef} />
            </div>
          </div>
        )}

        <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] -mx-4 mt-auto border-t border-line bg-bg px-4 pb-4 pt-3 sm:-mx-6 sm:px-6 md:bottom-0">
          {pending.length > 0 && (
            <div className="mb-3 rounded-xl bg-white p-3 ring-1 ring-line">
              <p className="text-sm text-muted">Repéré dans tes réponses</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {pending.map((s) => (
                  <li key={s.name} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-ink">
                    <SkillIcon category={s.category} className="h-4 w-4 text-muted" />
                    {s.name}
                  </li>
                ))}
              </ul>
              {session ? (
                <button onClick={saveFound} disabled={saving} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-sun hover:text-sun-700 disabled:opacity-50">
                  {saving ? "Un instant…" : `Ajouter ${pending.length > 1 ? "ces compétences" : "cette compétence"} à mon profil`}
                </button>
              ) : (
                <Link href="/connexion?mode=inscription" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-sun hover:text-sun-700">
                  Créer un compte pour les garder
                </Link>
              )}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <label htmlFor="msg" className="sr-only">Ton message</label>
            <input
              id="msg"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris ou parle"
              autoComplete="off"
              className="min-h-[52px] min-w-0 flex-1 rounded-xl border border-line bg-white px-4 text-[17px] text-ink transition-colors placeholder:text-slate-400 focus:border-sun focus:outline-none"
            />
            <VoiceButton onText={(t) => setInput((v) => (v.trim() ? `${v.trim()} ${t}` : t))} label="Parler" iconOnlyOnMobile className="min-h-[52px] min-w-[52px] shrink-0" />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-xl bg-sun px-4 text-base font-semibold text-white transition-colors hover:bg-sun-700 disabled:opacity-40"
            >
              Envoyer
            </button>
          </form>
          <p className="mt-2 text-xs text-muted">L&apos;assistant ne remplace pas un recruteur. Il ne te demandera jamais d&apos;argent ni de mot de passe.</p>
        </div>
      </main>
    </div>
  );
}
