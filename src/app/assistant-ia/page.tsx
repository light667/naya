"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CompassIcon, CheckIcon } from "@/components/PharIcons";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { localExtractSkills } from "@/lib/naya-local";

type Message = {
  sender: "ia" | "user";
  text: string;
  detectedSkills?: string[];
};

export default function AssistantIaPage() {
  const { session, profile, refreshProfile } = useAuth();
  const userName = profile?.full_name ? profile.full_name.split(" ")[0] : "";

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ia",
      text: userName
        ? `Bonjour ${userName} ! Raconte-moi ce que tu sais faire de tes mains (couture, artisanat, commerce, gestion...). J'identifie tes compétences pour éclairer ton cap.`
        : "Bonjour ! Raconte-moi ce que tu sais faire de tes mains (couture, artisanat, commerce, gestion...). J'identifie tes compétences pour éclairer ton cap.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [sessionSkills, setSessionSkills] = useState<string[]>(
    profile?.skills?.map((s) => s.name) || []
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const analysis = localExtractSkills(userText);
      const detected = analysis.skills;
      const newSkillNames = detected.map((s) => s.name);

      if (newSkillNames.length > 0) {
        setSessionSkills((prev) => Array.from(new Set([...prev, ...newSkillNames])));
      }

      const reply = detected.length > 0
        ? `Super, voici les compétences identifiées à valoriser auprès des recruteurs :`
        : `Bien noté ! Quels outils ou techniques utilises-tu au quotidien ?`;

      setMessages((prev) => [
        ...prev,
        {
          sender: "ia",
          text: reply,
          detectedSkills: detected.length > 0 ? newSkillNames : undefined,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ia",
          text: "Bien reçu. Continue à me décrire ton expérience.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSkills(false);
    }
  }

  return (
    <div className="h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C] overflow-hidden">
      <Navbar />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">
        
        {/* CHAT PRINCIPAL */}
        <div className="flex flex-col bg-white border-r border-[#E2ECF2] h-full overflow-hidden">
          
          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-xl ${
                  m.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {m.sender === "ia" ? (
                  <div className="w-8 h-8 rounded-lg bg-[#0A2A5C] text-[#FFB81C] flex items-center justify-center shrink-0">
                    <CompassIcon className="w-4 h-4 text-[#FFB81C]" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#22C3C9] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {userName ? userName[0].toUpperCase() : "U"}
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.sender === "ia"
                      ? "bg-[#F7FBFC] border border-[#E2ECF2] text-[#0A2A5C]"
                      : "bg-[#0A2A5C] text-white"
                  }`}
                >
                  <p>{m.text}</p>

                  {m.detectedSkills && m.detectedSkills.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#E2ECF2] flex flex-wrap gap-1.5">
                      {m.detectedSkills.map((s, i) => (
                        <span
                          key={i}
                          className="bg-white text-[#0A2A5C] border border-[#22C3C9] text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs"
                        >
                          <CheckIcon className="w-3 h-3 text-[#22C3C9]" /> {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-[#536B88] pl-11">
                <span className="w-2 h-2 rounded-full bg-[#22C3C9] animate-pulse" />
                Analyse...
              </div>
            )}
          </div>

          {/* CHIPS RAPIDES */}
          <div className="px-4 py-2 bg-[#FAFEFF] border-t border-[#E2ECF2] flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setInput("J'ai 2 ans d'expérience en couture, patronage wax et retouches.")}
              className="bg-white border border-[#E2ECF2] hover:border-[#22C3C9] px-3 py-1 rounded-full text-xs font-semibold text-[#0A2A5C] whitespace-nowrap"
            >
              Couture &amp; Wax
            </button>
            <button
              onClick={() => setInput("Je vends au marché, je gère les stocks et la caisse chaque jour.")}
              className="bg-white border border-[#E2ECF2] hover:border-[#22C3C9] px-3 py-1 rounded-full text-xs font-semibold text-[#0A2A5C] whitespace-nowrap"
            >
              Vente &amp; Caisse
            </button>
            <button
              onClick={() => setInput("Je fabrique des sacs et accessoires en cuir local.")}
              className="bg-white border border-[#E2ECF2] hover:border-[#22C3C9] px-3 py-1 rounded-full text-xs font-semibold text-[#0A2A5C] whitespace-nowrap"
            >
              Maroquinerie &amp; Cuir
            </button>
          </div>

          {/* INPUT BAR */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-[#E2ECF2] flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Décris une activité ou une compétence..."
              className="flex-1 bg-[#F8FCFD] border border-[#E2ECF2] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#FFB81C] hover:bg-[#ffc138] disabled:opacity-50 text-[#0A2A5C] font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all"
            >
              Envoyer
            </button>
          </form>

        </div>

        {/* SIDEBAR BOUSSOLE */}
        <aside className="hidden lg:block bg-[#F9FDFE] p-5 overflow-y-auto space-y-5">
          <div>
            <h2 className="font-display font-extrabold text-sm text-[#0A2A5C] mb-1">
              Boussole des Talents
            </h2>
            <p className="text-[11px] text-[#536B88] mb-3">
              Compétences détectées en temps réel
            </p>

            <div className="bg-white rounded-2xl p-4 border border-[#E2ECF2] shadow-2xs">
              {sessionSkills.length === 0 ? (
                <p className="text-xs text-[#536B88] text-center py-4">
                  Décris tes activités pour faire apparaître tes compétences.
                </p>
              ) : (
                <div className="space-y-1.5 mb-3">
                  {sessionSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-[#EFFAFB] px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#0A2A5C]"
                    >
                      <span>{skill}</span>
                      <CheckIcon className="w-3.5 h-3.5 text-[#22C3C9]" />
                    </div>
                  ))}
                </div>
              )}

              {session && sessionSkills.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveSkills}
                  disabled={savingSkills}
                  className="w-full bg-[#0A2A5C] hover:bg-[#0d3470] text-white text-xs font-extrabold py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {savingSkills
                    ? "Enregistrement..."
                    : savedSuccess
                    ? "Enregistré !"
                    : "Ajouter à mon profil"}
                </button>
              )}

              {!session && sessionSkills.length > 0 && (
                <Link
                  href="/connexion?mode=inscription"
                  className="block text-center w-full bg-[#FFB81C] hover:bg-[#ffc138] text-[#0A2A5C] text-xs font-extrabold py-2 rounded-xl transition-colors"
                >
                  Créer un compte
                </Link>
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
