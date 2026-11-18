"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CompassIcon, DocumentIcon, HandshakeIcon, CheckIcon } from "@/components/PharIcons";
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
        ? `Bonjour ${userName} ! Je suis ton guide PHAR. Raconte-moi simplement ce que tu sais faire de tes mains, tes expériences dans un atelier, sur un marché ou tes projets personnels. Chaque savoir-faire a de la valeur.`
        : "Bonjour ! Je suis ton guide PHAR. Raconte-moi simplement ce que tu sais faire de tes mains, tes expériences dans un atelier, sur un marché ou tes projets personnels. Chaque savoir-faire a de la valeur.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Compétences détectées pendant la session ou déjà dans le profil
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
      // Extraction intelligente des compétences via le moteur d'analyse
      const analysis = localExtractSkills(userText);
      const detected = analysis.skills;
      const newSkillNames = detected.map((s) => s.name);

      if (newSkillNames.length > 0) {
        setSessionSkills((prev) => Array.from(new Set([...prev, ...newSkillNames])));
      }

      let reply = "";
      if (detected.length > 0) {
        reply = `J'ai bien repéré tes savoir-faire ! C'est exactement le type de compétences pratiques que nos ateliers et entreprises partenaires recherchent :`;
      } else {
        reply = `Merci pour cette précision. Raconte-m'en un peu plus : quels outils utilises-tu ? Comment s'organise une journée type ou quelle création as-tu réalisée récemment ?`;
      }

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
          text: "J'ai bien pris note de ton message. Continue à me décrire tes compétences pour affiner ton cap professionnel.",
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
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Erreur enregistrement compétences:", err);
    } finally {
      setSavingSkills(false);
    }
  }

  function handleChipClick(chipText: string) {
    setInput(chipText);
  }

  return (
    <div className="h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C] overflow-hidden">
      <Navbar />

      {/* SPLIT LAYOUT ASSISTANT PLEINE PAGE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] overflow-hidden">
        
        {/* COLONNE CHAT PRINCIPALE */}
        <div className="flex flex-col bg-white border-r border-[#E2ECF2] h-full overflow-hidden">
          
          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3.5 max-w-2xl ${
                  m.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {m.sender === "ia" ? (
                  <div className="w-10 h-10 rounded-xl bg-[#0A2A5C] text-[#FFB81C] flex items-center justify-center shrink-0 shadow-sm">
                    <CompassIcon className="w-5 h-5 text-[#FFB81C]" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#22C3C9] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    {userName ? userName[0].toUpperCase() : "U"}
                  </div>
                )}

                <div
                  className={`p-5 rounded-2xl text-sm leading-relaxed ${
                    m.sender === "ia"
                      ? "bg-[#F7FBFC] border border-[#E2ECF2] text-[#0A2A5C] rounded-tl-xs"
                      : "bg-[#0A2A5C] text-white rounded-tr-xs"
                  }`}
                >
                  <p>{m.text}</p>

                  {m.detectedSkills && m.detectedSkills.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-[#E2ECF2]">
                      <span className="text-[11px] font-extrabold text-[#129aa0] uppercase tracking-wider block mb-2">
                        Compétences identifiées :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.detectedSkills.map((s, i) => (
                          <span
                            key={i}
                            className="bg-white border border-[#22C3C9] text-[#0A2A5C] text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
                          >
                            <CheckIcon className="w-3.5 h-3.5 text-[#22C3C9]" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3.5 max-w-2xl">
                <div className="w-10 h-10 rounded-xl bg-[#0A2A5C] text-[#FFB81C] flex items-center justify-center shrink-0">
                  <CompassIcon className="w-5 h-5 text-[#FFB81C] animate-pulse" />
                </div>
                <div className="bg-[#F7FBFC] border border-[#E2ECF2] p-4 rounded-2xl text-xs text-[#536B88] flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#22C3C9] animate-bounce" />
                  <span className="inline-block w-2 h-2 rounded-full bg-[#22C3C9] animate-bounce [animation-delay:0.2s]" />
                  <span className="inline-block w-2 h-2 rounded-full bg-[#22C3C9] animate-bounce [animation-delay:0.4s]" />
                  <span>Analyse de tes compétences en cours...</span>
                </div>
              </div>
            )}
          </div>

          {/* SUGGESTIONS RAPIDES */}
          <div className="px-6 py-2.5 bg-[#FAFEFF] border-t border-[#E2ECF2] flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleChipClick("J'ai 2 ans d'expérience en couture, coupe de tissu wax et retouches")}
              className="bg-white border border-[#E2ECF2] hover:border-[#22C3C9] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0A2A5C] whitespace-nowrap transition-colors flex items-center gap-1.5"
            >
              <CompassIcon className="w-3.5 h-3.5 text-[#22C3C9]" /> Atelier couture &amp; Wax
            </button>
            <button
              onClick={() => handleChipClick("Je vends au marché, je gère les stocks et la caisse chaque jour")}
              className="bg-white border border-[#E2ECF2] hover:border-[#22C3C9] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0A2A5C] whitespace-nowrap transition-colors flex items-center gap-1.5"
            >
              <DocumentIcon className="w-3.5 h-3.5 text-[#0A2A5C]" /> Vente directe &amp; Caisse
            </button>
            <button
              onClick={() => handleChipClick("Je fabrique des sacs en cuir et accessoires artisanaux")}
              className="bg-white border border-[#E2ECF2] hover:border-[#22C3C9] px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0A2A5C] whitespace-nowrap transition-colors flex items-center gap-1.5"
            >
              <HandshakeIcon className="w-3.5 h-3.5 text-[#FFB81C]" /> Artisanat maroquinerie
            </button>
          </div>

          {/* INPUT BAR */}
          <form onSubmit={handleSend} className="p-4 sm:p-6 bg-white border-t border-[#E2ECF2] flex gap-3 items-center">
            <div className="flex-1 flex items-center bg-[#F8FCFD] border border-[#E2ECF2] rounded-xl px-4 py-2 focus-within:border-[#22C3C9] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#22C3C9]/15">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Raconte une expérience ou décris ce que tu sais faire..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[#0A2A5C] py-1"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#FFB81C] hover:bg-[#ffc138] disabled:opacity-50 text-[#0A2A5C] font-extrabold text-sm px-6 py-3 rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              Envoyer
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m22 2-11 11M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>

        </div>

        {/* COLONNE DROITE : BOUSSOLE EN DIRECT */}
        <aside className="hidden lg:block bg-[#F9FDFE] p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="font-display font-extrabold text-base text-[#0A2A5C] mb-1">
              Boussole en Direct
            </h2>
            <p className="text-xs text-[#536B88] mb-4">
              Savoir-faire reconnus au fil de notre échange
            </p>

            <div className="bg-white rounded-2xl p-5 border border-[#E2ECF2] shadow-sm">
              <span className="inline-block bg-[#22C3C9]/15 text-[#129aa0] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mb-3">
                {sessionSkills.length > 0 ? `${sessionSkills.length} Compétence(s) validée(s)` : "Diagnostic en cours"}
              </span>

              {sessionSkills.length === 0 ? (
                <div className="text-center py-6">
                  <CompassIcon className="w-8 h-8 text-[#22C3C9] mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-[#536B88]">
                    Parle à l&apos;assistant de tes activités quotidiennes pour éclairer tes savoir-faire.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {sessionSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-[#EFFAFB] px-3 py-2 rounded-lg text-xs font-bold text-[#0A2A5C]"
                    >
                      <span>{skill}</span>
                      <span className="text-[#129aa0] flex items-center gap-1">
                        <CheckIcon className="w-3.5 h-3.5" /> Reconnue
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {session && sessionSkills.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveSkills}
                  disabled={savingSkills}
                  className="w-full bg-[#0A2A5C] hover:bg-[#0d3470] text-white text-xs font-extrabold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  {savingSkills
                    ? "Enregistrement..."
                    : savedSuccess
                    ? "Enregistré dans ton profil !"
                    : "Ajouter à mon profil PHAR"}
                </button>
              )}

              {!session && sessionSkills.length > 0 && (
                <Link
                  href="/connexion?mode=inscription"
                  className="block text-center w-full bg-[#FFB81C] hover:bg-[#ffc138] text-[#0A2A5C] text-xs font-extrabold py-2.5 rounded-xl transition-colors"
                >
                  Créer mon compte pour sauvegarder
                </Link>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-display font-extrabold text-base text-[#0A2A5C] mb-1">
              Mentorat &amp; Réseau
            </h2>
            <p className="text-xs text-[#536B88] mb-3">
              Des professionnels certifiés pour t&apos;accompagner
            </p>

            <div className="bg-white rounded-2xl p-4 border border-[#E2ECF2] shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A2A5C] text-[#FFB81C] flex items-center justify-center font-bold text-xs shrink-0">
                  <HandshakeIcon className="w-5 h-5 text-[#FFB81C]" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#0A2A5C]">Réseau des Mentors PHAR</div>
                  <div className="text-[11px] text-[#536B88]">Maîtres artisans &amp; chefs d&apos;ateliers</div>
                </div>
              </div>
              <Link
                href="/communaute"
                className="block text-center bg-[#EFFAFB] hover:bg-[#E2ECF2] text-[#0A2A5C] text-xs font-bold py-2 rounded-lg transition-colors"
              >
                Rejoindre l&apos;Équipage PHAR →
              </Link>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
