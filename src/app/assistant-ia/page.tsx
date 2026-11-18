"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  sender: "ia" | "user";
  text: string;
  detectedSkills?: string[];
  suggestions?: string[];
  timestamp: string;
};

const STARTER_PROMPTS = [
  "Comment valoriser mon expérience en couture sans diplôme ?",
  "Quels tarifs puis-je demander pour de la vente ou gestion de caisse ?",
  "Simule un entretien d'embauche pour voir comment je réponds",
  "Aide-moi à rédiger une accroche WhatsApp pour mes services",
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
      text: userName
        ? `Bonjour ${userName}. Je suis ton assistant carrière NAYA. Raconte-moi ce que tu sais faire (couture, artisanat, commerce, gestion, digital) ou pose-moi une question sur tes tarifs, tes candidatures ou tes entretiens.`
        : "Bonjour. Je suis ton assistant carrière NAYA. Raconte-moi tes expériences de terrain (couture, artisanat, commerce, gestion, digital) ou pose-moi tes questions sur tes tarifs, tes candidatures et tes entretiens.",
      suggestions: STARTER_PROMPTS,
      timestamp: "À l'instant",
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

    const history = messages.slice(-6).map((m) => ({
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />

      {/* EN-TÊTE ÉPURÉ */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              IA Carrière active
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Assistant IA &amp; Orientation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Échange libre pour révéler tes compétences, préparer tes candidatures et fixer tes tarifs.
            </p>
          </div>

          {sessionSkills.length > 0 && session && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveSkills}
                disabled={savingSkills}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition-all disabled:opacity-50"
              >
                {savedSuccess ? (
                  <span>Compétences enregistrées</span>
                ) : savingSkills ? (
                  <span>Enregistrement...</span>
                ) : (
                  <span>Enregistrer ({sessionSkills.length}) dans mon profil</span>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ZONE CENTRALE DU CHAT */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* FIL DE DISCUSSION */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 flex flex-col min-h-[520px]">
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {messages.map((m) => {
              const isIa = m.sender === "ia";
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 text-sm ${isIa ? "items-start" : "items-start flex-row-reverse"}`}
                >
                  {/* AVATAR */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isIa
                        ? "bg-slate-900 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isIa ? "N" : (userName ? userName[0].toUpperCase() : "T")}
                  </div>

                  {/* BULLE MESSAGE */}
                  <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col gap-2 ${isIa ? "items-start" : "items-end"}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                        isIa
                          ? "bg-slate-50 text-slate-800 border border-slate-200/70 rounded-tl-sm"
                          : "bg-slate-900 text-white rounded-tr-sm font-normal"
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* COMPÉTENCES DÉTECTÉES PAR LE MESSAGE */}
                    {isIa && m.detectedSkills && m.detectedSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-medium text-slate-400">Compétences repérées :</span>
                        {m.detectedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px] font-medium border border-sky-200/70"
                          >
                            + {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* SUGGESTIONS DE QUESTIONS RAPIDES (SANS EMOJI) */}
                    {isIa && m.suggestions && m.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {m.suggestions.map((sug) => (
                          <button
                            key={sug}
                            onClick={() => sendMessage(sug)}
                            className="text-left text-[11px] px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 transition-all shadow-2xs"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 px-1">{m.timestamp}</span>
                  </div>
                </div>
              );
            })}

            {/* CHARGEMENT EN COURS */}
            {loading && (
              <div className="flex gap-3 items-center text-slate-500 text-xs">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
                  N
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-slate-400 text-xs ml-1 font-medium">L&apos;assistant réfléchit...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* FORMULAIRE DE SAISIE */}
          <form onSubmit={handleFormSubmit} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose une question ou décris une de tes expériences..."
              disabled={loading}
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            >
              Envoyer
            </button>
          </form>
        </div>

        {/* PIED DE PAGE : RAPPEL D'INCLUSION */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-2">
          <p>L&apos;assistant NAYA valorise tous les savoir-faire, formels ou informels.</p>
          {!session && (
            <Link href="/connexion?mode=inscription" className="text-slate-700 hover:text-slate-950 font-medium underline">
              Crée ton compte pour enregistrer tes compétences
            </Link>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
