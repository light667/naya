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
  const [notice, setNotice] = useState<string | null>(null);

  // Redirection automatique sur le tableau de bord si déjà connecté
  useEffect(() => {
    if (!authLoading && session) {
      router.replace("/app");
    }
  }, [session, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const roleMapping = role === "entreprise" ? "recruteur" : "talent";

    try {
      if (mode === "inscription") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
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
          if (/already registered/i.test(signUpError.message)) {
            setError("Un compte existe déjà avec cet email. Connecte-toi ci-dessous.");
            setMode("connexion");
          } else if (/password/i.test(signUpError.message)) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
          } else {
            setError(signUpError.message);
          }
          setLoading(false);
          return;
        }

        // Cas 1 : Connexion directe confirmée
        if (data.session) {
          try {
            await supabase.from("profiles").upsert({
              id: data.session.user.id,
              full_name: fullName,
              role: roleMapping,
              city: city.trim(),
            });
          } catch (profileErr) {
            console.warn("[Auth] Erreur upsert profil:", profileErr);
          }

          window.location.href = "/app";
          return;
        }

        // Cas 2 : Tentative immédiate de connexion
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!signInError && signInData.session && signInData.user) {
          try {
            await supabase.from("profiles").upsert({
              id: signInData.user.id,
              full_name: fullName,
              role: roleMapping,
              city: city.trim(),
            });
          } catch (profileErr) {
            console.warn("[Auth] Erreur upsert profil:", profileErr);
          }

          window.location.href = "/app";
          return;
        }

        // Si validation email nécessaire
        if (signInError && /email not confirmed/i.test(signInError.message)) {
          setNotice(
            "Compte créé avec succès ! Si la confirmation par email est requise, vérifie ta boîte de réception."
          );
          setLoading(false);
          return;
        }

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        setNotice("Compte créé avec succès ! Connecte-toi avec tes identifiants.");
        setMode("connexion");
        setLoading(false);
      } else {
        // MODE CONNEXION
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (signInError) {
          if (/invalid login/i.test(signInError.message)) {
            setError("Email ou mot de passe incorrect.");
          } else if (/email not confirmed/i.test(signInError.message)) {
            setError("Email non encore confirmé. Vérifie ta boîte de réception.");
          } else {
            setError(signInError.message);
          }
          setLoading(false);
          return;
        }

        if (signInData.session) {
          window.location.href = "/app";
        } else {
          setError("Impossible d'établir la session.");
          setLoading(false);
        }
      }
    } catch (err: unknown) {
      console.error("[Auth] Exception:", err);
      setError(err instanceof Error ? err.message : "Erreur inattendue de connexion.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* HEADER SIMPLE */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-12 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/img/logo_phar_trimmed.png"
            alt="PHAR"
            width={110}
            height={34}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          Retour au site →
        </Link>
      </header>

      {/* CONTAINER FORMULAIRE */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 grid grid-cols-1 md:grid-cols-[340px_1fr] gap-8 items-center my-auto">
        
        {/* COLONNE GAUCHE : VISUEL INSPIRANT */}
        <div className="relative rounded-2xl overflow-hidden shadow-xs h-[220px] md:h-[500px] p-6 flex flex-col justify-end bg-slate-900">
          <Image
            src="/img/accueil.jpg"
            alt="Talent en activité"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
          <div className="relative z-10 text-white space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase">
              Impact &amp; Inclusion
            </span>
            <h2 className="text-xl font-bold leading-snug tracking-tight">
              Chaque parcours a une valeur. Révèle la tienne.
            </h2>
            <p className="text-xs text-slate-300">
              Des opportunités concrètes et vérifiées pour les jeunes talents.
            </p>
          </div>
        </div>

        {/* COLONNE DROITE : FORMULAIRE */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
          
          {/* SWITCH CONNEXION / INSCRIPTION */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-xs">
            <button
              type="button"
              onClick={() => {
                setMode("connexion");
                setError(null);
                setNotice(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "connexion" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("inscription");
                setError(null);
                setNotice(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "inscription" ? "bg-white text-slate-950 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Créer un compte
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-950 mb-1 tracking-tight">
            {mode === "inscription" ? "Rejoindre la communauté" : "Bon retour parmi nous"}
          </h1>
          <p className="text-xs text-slate-500 mb-6">
            {mode === "inscription"
              ? "Crée ton profil en quelques instants pour valoriser tes acquis."
              : "Saisis tes identifiants pour accéder à ton espace candidat."}
          </p>

          {/* MESSAGE D'ERREUR */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* MESSAGE D'INFORMATION */}
          {notice && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              {notice}
            </div>
          )}

          {/* SÉLECTEUR DE RÔLE */}
          {mode === "inscription" && (
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-slate-500 mb-2">Je m&apos;inscris en tant que :</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("jeune")}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    role === "jeune"
                      ? "border-slate-900 bg-slate-900 text-white font-semibold shadow-xs"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <CompassIcon className={`w-4 h-4 mx-auto mb-1 ${role === "jeune" ? "text-white" : "text-slate-500"}`} />
                  <div className="text-[11px]">Talent</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("entreprise")}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    role === "entreprise"
                      ? "border-slate-900 bg-slate-900 text-white font-semibold shadow-xs"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <BuildingIcon className={`w-4 h-4 mx-auto mb-1 ${role === "entreprise" ? "text-white" : "text-slate-500"}`} />
                  <div className="text-[11px]">Entreprise</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("mentor")}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                    role === "mentor"
                      ? "border-slate-900 bg-slate-900 text-white font-semibold shadow-xs"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <HandshakeIcon className={`w-4 h-4 mx-auto mb-1 ${role === "mentor" ? "text-white" : "text-slate-500"}`} />
                  <div className="text-[11px]">Mentor</div>
                </button>
              </div>
            </div>
          )}

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "inscription" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ton prénom"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-slate-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nom</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ton nom"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-slate-900 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ville de résidence</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Cotonou, Lomé, Dakar, Abidjan..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Adresse email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton.email@exemple.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm py-3 rounded-xl transition-all shadow-xs mt-3 disabled:opacity-50"
            >
              {loading
                ? "Connexion en cours..."
                : mode === "inscription"
                ? "Créer mon compte"
                : "Se connecter"}
            </button>
          </form>

        </div>

      </main>

      <footer className="text-center py-6 text-xs text-slate-400">
        PHAR / NAYA © {new Date().getFullYear()} · Tous droits réservés
      </footer>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AuthFormContent />
    </Suspense>
  );
}
