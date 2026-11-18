"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { CompassIcon, BuildingIcon, HandshakeIcon } from "@/components/PharIcons";

function AuthFormContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { session, profile, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<"connexion" | "inscription">(
    params.get("mode") === "inscription" ? "inscription" : "connexion"
  );
  const [role, setRole] = useState<"jeune" | "entreprise" | "mentor">(
    (params.get("role") as "jeune" | "entreprise" | "mentor") || "jeune"
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (!authLoading && session) {
      router.replace("/app");
    }
  }, [session, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "inscription") {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        const roleMapping = role === "entreprise" ? "recruteur" : "talent";

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName,
              role: roleMapping,
              phar_role: role,
              city: city.trim(),
            },
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else if (data.session) {
          router.replace("/app");
        } else {
          setMessage(
            "Ton compte a été créé avec succès ! Si un email de confirmation t'a été envoyé, clique sur le lien pour valider ton inscription."
          );
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          if (signInError.message.includes("Invalid login credentials")) {
            setError("Email ou mot de passe incorrect. Vérifie tes identifiants.");
          } else {
            setError(signInError.message);
          }
        } else if (data.session) {
          router.replace("/app");
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C]">
      {/* HEADER SIMPLE */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E2ECF2] px-6 lg:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/img/logo_phar_trimmed.png"
            alt="PHAR"
            width={140}
            height={44}
            className="h-11 w-auto object-contain"
            priority
          />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#0A2A5C] hover:text-[#22C3C9] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour à l'accueil
        </Link>
      </header>

      {/* CONTAINER PRINCIPAL EN 2 COLONNES */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-stretch my-auto">
        
        {/* COLONNE GAUCHE : PHOTO FORTE ET LUMINEUSE */}
        <div className="relative rounded-[32px] overflow-hidden shadow-lg min-h-[460px] lg:min-h-[640px] flex flex-col justify-between p-8 sm:p-12">
          <Image
            src="/img/accueil.jpg"
            alt="Talent PHAR"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2A5C]/90 via-[#0A2A5C]/40 to-black/20" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-white/95 text-[#0A2A5C] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FFB81C]" />
              PHAR : Le cap de ton avenir
            </span>
          </div>

          <div className="relative z-10 text-white space-y-3">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-snug">
              « Révèle tes talents, rejoins{" "}
              <span className="text-[#FFB81C]">les opportunités</span> qui t'attendent à l'horizon. »
            </h2>
            <p className="text-sm sm:text-base text-white/90 max-w-md">
              Une plateforme pensée pour valoriser chaque expérience, qu'elle vienne de l'école, de l'atelier ou du marché.
            </p>
          </div>
        </div>

        {/* COLONNE DROITE : FORMULAIRE PROPRE SANS DONNÉES PAR DÉFAUT */}
        <div className="bg-white rounded-[32px] p-8 sm:p-12 shadow-sm border border-[#E2ECF2] flex flex-col justify-center">
          
          {/* TABS CONNEXION / INSCRIPTION */}
          <div className="flex bg-[#EFFAFB] p-1.5 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => {
                setMode("connexion");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all ${
                mode === "connexion" ? "bg-white text-[#0A2A5C] shadow-sm" : "text-[#536B88]"
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("inscription");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all ${
                mode === "inscription" ? "bg-white text-[#0A2A5C] shadow-sm" : "text-[#536B88]"
              }`}
            >
              Créer mon compte
            </button>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2A5C] mb-2">
            {mode === "inscription" ? "Créer un compte PHAR" : "Connexion à ton compte"}
          </h1>
          <p className="text-sm text-[#536B88] mb-6">
            {mode === "inscription"
              ? "Rejoins l'écosystème pour révéler tes talents et accéder aux opportunités."
              : "Saisis tes identifiants pour accéder à ton espace personnel."}
          </p>

          {/* ALERTE D'ERREUR */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* ALERTE DE SUCCÈS */}
          {message && (
            <div className="mb-6 p-4 rounded-xl bg-[#EFFAFB] border border-[#22C3C9] text-[#0A2A5C] text-sm font-medium">
              {message}
            </div>
          )}

          {/* SÉLECTEUR DE RÔLE : JEUNE / ENTREPRISE / MENTOR */}
          {mode === "inscription" && (
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#0A2A5C] mb-2.5">
                Je rejoins PHAR en tant que :
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole("jeune")}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    role === "jeune"
                      ? "border-[#22C3C9] bg-[#22C3C9]/10 text-[#0A2A5C]"
                      : "border-[#E2ECF2] bg-white text-[#536B88] hover:border-[#22C3C9]"
                  }`}
                >
                  <CompassIcon className="w-5 h-5 text-[#22C3C9] mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-[#0A2A5C]">Jeune Talent</div>
                  <div className="text-[10px] text-[#536B88]">18 - 30 ans</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("entreprise")}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    role === "entreprise"
                      ? "border-[#22C3C9] bg-[#22C3C9]/10 text-[#0A2A5C]"
                      : "border-[#E2ECF2] bg-white text-[#536B88] hover:border-[#22C3C9]"
                  }`}
                >
                  <BuildingIcon className="w-5 h-5 text-[#0A2A5C] mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-[#0A2A5C]">Entreprise</div>
                  <div className="text-[10px] text-[#536B88]">Recruteur</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("mentor")}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    role === "mentor"
                      ? "border-[#22C3C9] bg-[#22C3C9]/10 text-[#0A2A5C]"
                      : "border-[#E2ECF2] bg-white text-[#536B88] hover:border-[#22C3C9]"
                  }`}
                >
                  <HandshakeIcon className="w-5 h-5 text-[#FFB81C] mx-auto mb-1.5" />
                  <div className="text-xs font-bold text-[#0A2A5C]">Mentor</div>
                  <div className="text-[10px] text-[#536B88]">Accompagnateur</div>
                </button>
              </div>
            </div>
          )}

          {/* FORMULAIRE SANS SUGGESTIONS PAR DÉFAUT */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "inscription" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0A2A5C] mb-1.5">Prénom</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ton prénom"
                      className="w-full px-4 py-3 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] outline-none focus:border-[#22C3C9] focus:ring-2 focus:ring-[#22C3C9]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0A2A5C] mb-1.5">Nom</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ton nom"
                      className="w-full px-4 py-3 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] outline-none focus:border-[#22C3C9] focus:ring-2 focus:ring-[#22C3C9]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A2A5C] mb-1.5">Ville &amp; Pays</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Cotonou, Bénin"
                    className="w-full px-4 py-3 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] outline-none focus:border-[#22C3C9] focus:ring-2 focus:ring-[#22C3C9]/20"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#0A2A5C] mb-1.5">Adresse email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton.email@exemple.com"
                className="w-full px-4 py-3 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] outline-none focus:border-[#22C3C9] focus:ring-2 focus:ring-[#22C3C9]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A2A5C] mb-1.5">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full px-4 py-3 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] outline-none focus:border-[#22C3C9] focus:ring-2 focus:ring-[#22C3C9]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFB81C] text-[#0A2A5C] font-extrabold text-base py-3.5 rounded-xl shadow-[0_4px_16px_rgba(255,184,28,0.35)] hover:bg-[#ffc138] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 pt-3 disabled:opacity-50"
            >
              {loading ? (
                "Traitement en cours..."
              ) : mode === "inscription" ? (
                "Créer mon compte"
              ) : (
                "Se connecter"
              )}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <p className="text-xs text-[#536B88] text-center mt-6">
            En continuant, tu acceptes les conditions d'utilisation et la charte d'inclusion de PHAR.
          </p>
        </div>

      </main>

      <footer className="text-center py-4 text-xs text-[#536B88] border-t border-[#E2ECF2] bg-white">
        Plateforme PHAR — Inclusion &amp; Employabilité des Jeunes
      </footer>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthFormContent />
    </Suspense>
  );
}
