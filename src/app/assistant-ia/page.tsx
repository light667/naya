"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  sender: "ia" | "user";
  text: string;
  detectedSkills?: string[];
  suggestions?: string[];
  timestamp?: string;
};

const STARTER_PROMPTS = [
  { label: "Révéler mes compétences", prompt: "Aide-moi à trouver mes compétences. Pose-moi des questions simples, une à la fois." },
  { label: "Calculer mon prix pour un travail", prompt: "Aide-moi à calculer mon prix pour un travail : le coût de la matière, le temps passé et ma marge." },
  { label: "Simuler un entretien", prompt: "Simule un entretien d'embauche avec moi, puis donne-moi une note et des conseils." },
  { label: "Écrire un message WhatsApp pour mes clients", prompt: "Aide-moi à écrire un message WhatsApp court pour présenter mes services." },
];

function cleanPlainResponse(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // retire le gras markdown
    .replace(/\*(.*?)\*/g, "$1")     // retire l'italique markdown
    .replace(/#{1,6}\s?/g, "")       // retire les titres markdown #
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, "$1") // retire les backticks de code
    .replace(/^\s*•\s*/gm, "- ")     // normalise les puces
    .trim();
}

export default function AssistantIaPage() {
  const { session, profile, refreshProfile } = useAuth();
  const userName = profile?.full_name ? profile.full_name.split(" ")[0] : "";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ia",
      text: "",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [sessionSkills, setSessionSkills] = useState<string[]>(
    profile?.skills?.map((s) => s.name) || []
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (profile?.skills) {
      setSessionSkills(profile.skills.map((s) => s.name));
    }
  }, [profile]);

  async function sendMessage(textToSend: string) {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInput("");
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const history = messages.filter((m) => m.text).slice(-6).map((m) => ({
      role: m.sender === "ia" ? "assistant" : "user",
      content: m.text,
    }));

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/ai", {
        method: "POST",
        headers,
        body: JSON.stringify({
          kind: "chat",
          message: userText,
          history,
          userName: profile?.full_name || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const detected = Array.isArray(data.detectedSkills) ? data.detectedSkills : [];
        if (detected.length > 0) {
          setSessionSkills((prev) => Array.from(new Set([...prev, ...detected])));
        }

        const formattedText = cleanPlainResponse(data.reply);

        const iaMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ia",
          text: formattedText,
          detectedSkills: detected.length > 0 ? detected : undefined,
          suggestions: Array.isArray(data.suggestions) && data.suggestions.length ? data.suggestions : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, iaMsg]);
      } else {
        throw new Error(data.error || "Réponse non disponible");
      }
    } catch (err) {
      console.error("[assistant-ia] Erreur requête:", err);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ia",
        text: "Bien noté. Peux-tu me donner un exemple concret d'une situation où tu as mis cette compétence en pratique ?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  async function handleSaveSkills() {
    if (!profile || sessionSkills.length === 0) return;
    setSavingSkills(true);

    try {
      const formattedSkills = sessionSkills.map((name) => ({
        name,
        category: "Pratique",
        level: "intermédiaire" as const,
      }));

      const { error } = await supabase
        .from("profiles")
        .update({ skills: formattedSkills })
        .eq("id", profile.id);

      if (!error) {
        setSavedSuccess(true);
        if (refreshProfile) await refreshProfile();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSkills(false);
    }
  }

  const started = messages.length > 1;

  return (
    <div className="flex min-h-[100svh] flex-col">
      <Navbar />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 sm:px-6">
        {!started ? (
          /* Une seule chose à regarder : le titre, une phrase, la zone de saisie */
          <section className="pb-8 pt-10 sm:pt-16">
            <h1 className="text-[32px] font-semibold leading-[1.15] text-ink sm:text-4xl">{userName ? `Bonjour ${userName}` : "Raconte ce que tu sais faire"}</h1>
            <p className="mt-3 text-lg text-muted">Je suis l&apos;assistant PHAR. Dis-moi ton métier et ce que tu fais chaque jour, je t&apos;aide à le montrer aux employeurs.</p>
            <ul className="mt-8 space-y-2">
              {STARTER_PROMPTS.map((sp) => (
                <li key={sp.label}>
                  <button
                    onClick={() => sendMessage(sp.prompt)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-white px-4 text-left text-base text-ink ring-1 ring-line transition-colors hover:bg-slate-50"
                  >
                    {sp.label}
                    <span aria-hidden className="text-muted">→</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="flex-1 space-y-6 py-8" aria-live="polite">
            {messages.slice(1).map((m) => {
              const isIa = m.sender === "ia";
              return (
                <div key={m.id} className={isIa ? "" : "flex justify-end"}>
                  {isIa ? (
                    <div>
                      <p className="whitespace-pre-line text-base text-ink">{m.text}</p>
                      {m.detectedSkills && m.detectedSkills.length > 0 && (
                        <p className="mt-3 text-sm text-sage">Repéré : {m.detectedSkills.join(", ")}</p>
                      )}
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.suggestions.map((sug) => (
                            <button
                              key={sug}
                              onClick={() => sendMessage(sug)}
                              className="min-h-11 rounded-xl bg-white px-3 py-2 text-left text-sm text-ink ring-1 ring-line transition-colors hover:bg-slate-50"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-slate-100 px-4 py-3 text-base text-ink">{m.text}</p>
                  )}
                </div>
              );
            })}
            {loading && (
              <p className="flex items-center gap-2 text-sm text-muted">
                <span className="flex gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.3s]" />
                </span>
                L&apos;assistant écrit…
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Zone de saisie fixe en bas, au-dessus de la barre de navigation */}
        <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] -mx-4 mt-auto border-t border-line bg-bg px-4 pb-4 pt-3 sm:-mx-6 sm:px-6 md:bottom-0">
          {sessionSkills.length > 0 && (
            <div className="mb-2 flex min-h-11 items-center justify-between gap-3 text-sm">
              <span className="text-muted">
                {sessionSkills.length} compétence{sessionSkills.length > 1 ? "s" : ""} repérée{sessionSkills.length > 1 ? "s" : ""}
              </span>
              {session ? (
                <button onClick={handleSaveSkills} disabled={savingSkills} className="min-h-11 px-1 font-semibold text-sun hover:text-sun-700 disabled:opacity-50">
                  {savedSuccess ? "Enregistrées" : savingSkills ? "Un instant…" : "Enregistrer dans mon profil"}
                </button>
              ) : (
                <Link href="/connexion?mode=inscription" className="inline-flex min-h-11 items-center px-1 font-semibold text-sun hover:text-sun-700">
                  Créer un compte pour les garder
                </Link>
              )}
            </div>
          )}
          <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
            <label htmlFor="msg" className="sr-only">Ton message</label>
            <input
              id="msg"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris ton message"
              disabled={loading}
              autoComplete="off"
              className="min-h-[52px] min-w-0 flex-1 rounded-xl border border-line bg-white px-4 text-base text-ink transition-colors placeholder:text-slate-400 focus:border-sun focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-xl bg-sun px-5 text-base font-semibold text-white transition-colors hover:bg-sun-700 disabled:opacity-40"
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
