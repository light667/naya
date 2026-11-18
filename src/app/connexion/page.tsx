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
  const { session, loading: authLoading } = useAuth();

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

  // Redirection automatique sur le home page si déjà connecté
  useEffect(() => {
    if (!authLoading && session) {
      router.replace("/");
    }
  }, [session, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // Si la session est créée directement (pas de confirmation email demandée par Supabase)
        if (data.session) {
          window.location.href = "/";
          return;
        }

        // Sinon, tentative de connexion immédiate par mot de passe
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (!signInError && signInData.session) {
          window.location.href = "/";
          return;
        }

        // Si Supabase requiert encore la confirmation email dans le tableau de bord
        if (signInError && signInError.message.includes("Email not confirmed")) {
          setError(
            "Inscription validée ! (Supabase attend la confirmation par email : vous pouvez désactiver l'option 'Confirm email' dans Authentication > Providers > Email de Supabase pour une connexion 100% instantanée)."
          );
          setLoading(false);
          return;
        }

        // Par défaut, redirection sur le home page
        window.location.href = "/";
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          if (signInError.message.includes("Invalid login credentials")) {
            setError("Identifiants incorrects. Vérifie ton email et mot de passe.");
          } else {
            setError(signInError.message);
          }
          setLoading(false);
          return;
        }

        if (data.session) {
          window.location.href = "/";
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C]">
      {/* NAVBAR SIMPLE */}
      <header className="bg-white/95 border-b border-[#E2ECF2] px-6 lg:px-12 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/img/logo_phar_trimmed.png"
            alt="PHAR"
            width={120}
            height={38}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-[#536B88] hover:text-[#0A2A5C] transition-colors"
        >
          Retour à l&apos;accueil →
        </Link>
      </header>

      {/* CONTAINER SIMPLE ET ÉPURÉ */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-center my-auto">
        
        {/* COLONNE GAUCHE : PHOTO ÉPURÉE */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm h-[220px] lg:h-[580px] p-6 lg:p-8 flex flex-col justify-end">
          <Image
            src="/img/accueil.jpg"
            alt="Talent PHAR"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2A5C]/90 via-[#0A2A5C]/30 to-transparent" />
          <div className="relative z-10 text-white">
            <span className="inline-block bg-[#FFB81C] text-[#0A2A5C] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md mb-2">
              PHAR
            </span>
            <h2 className="font-display text-xl lg:text-2xl font-extrabold leading-snug">
              Ton avenir a un cap. <span className="text-[#22C3C9]">PHAR l&apos;éclaire.</span>
            </h2>
          </div>
        </div>

        {/* COLONNE DROITE : FORMULAIRE ÉPURÉ SANS TEXTES LOURDS */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#E2ECF2]">
          
          {/* SWITCH CONNEXION / INSCRIPTION */}
          <div className="flex bg-[#EFFAFB] p-1 rounded-xl mb-6 max-w-sm">
            <button
              type="button"
              onClick={() => {
                setMode("connexion");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
                mode === "connexion" ? "bg-white text-[#0A2A5C] shadow-xs" : "text-[#536B88]"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("inscription");
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
                mode === "inscription" ? "bg-white text-[#0A2A5C] shadow-xs" : "text-[#536B88]"
              }`}
            >
              Créer un compte
            </button>
          </div>

          <h1 className="font-display text-2xl font-extrabold text-[#0A2A5C] mb-1">
            {mode === "inscription" ? "Rejoindre PHAR" : "Bon retour parmi nous"}
          </h1>
          <p className="text-xs text-[#536B88] mb-6">
            {mode === "inscription"
              ? "Crée ton profil en 30 secondes."
              : "Accède directement à ton espace."}
          </p>

          {/* ERREUR */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* SÉLECTEUR DE RÔLE RAPIDE */}
          {mode === "inscription" && (
            <div className="mb-5">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("jeune")}
                  className={`py-2 px-3 rounded-xl border-2 text-center transition-all ${
                    role === "jeune"
                      ? "border-[#22C3C9] bg-[#22C3C9]/10 text-[#0A2A5C]"
                      : "border-[#E2ECF2] text-[#536B88] hover:border-[#22C3C9]"
                  }`}
                >
                  <CompassIcon className="w-4 h-4 mx-auto mb-1 text-[#22C3C9]" />
                  <div className="text-xs font-extrabold">Jeune</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("entreprise")}
                  className={`py-2 px-3 rounded-xl border-2 text-center transition-all ${
                    role === "entreprise"
                      ? "border-[#22C3C9] bg-[#22C3C9]/10 text-[#0A2A5C]"
                      : "border-[#E2ECF2] text-[#536B88] hover:border-[#22C3C9]"
                  }`}
                >
                  <BuildingIcon className="w-4 h-4 mx-auto mb-1 text-[#0A2A5C]" />
                  <div className="text-xs font-extrabold">Entreprise</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("mentor")}
                  className={`py-2 px-3 rounded-xl border-2 text-center transition-all ${
                    role === "mentor"
                      ? "border-[#22C3C9] bg-[#22C3C9]/10 text-[#0A2A5C]"
                      : "border-[#E2ECF2] text-[#536B88] hover:border-[#22C3C9]"
                  }`}
                >
                  <HandshakeIcon className="w-4 h-4 mx-auto mb-1 text-[#FFB81C]" />
                  <div className="text-xs font-extrabold">Mentor</div>
                </button>
              </div>
            </div>
          )}

          {/* FORMULAIRE ÉPURÉ */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "inscription" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#536B88] mb-1">Prénom</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ton prénom"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECF2] text-xs text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#536B88] mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ton nom"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECF2] text-xs text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#536B88] mb-1">Ville</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Cotonou, Dakar, Abidjan..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECF2] text-xs text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#536B88] mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton.email@exemple.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECF2] text-xs text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#536B88] mb-1">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECF2] text-xs text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFB81C] hover:bg-[#ffc138] text-[#0A2A5C] font-extrabold text-sm py-3 rounded-xl transition-all shadow-xs mt-2 disabled:opacity-50"
            >
              {loading
                ? "Connexion..."
                : mode === "inscription"
                ? "Créer mon compte"
                : "Se connecter"}
            </button>
          </form>

        </div>

      </main>

      <footer className="text-center py-4 text-xs text-[#536B88]">
        PHAR © 2026
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
