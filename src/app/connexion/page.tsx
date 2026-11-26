"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Button, Input, Logo, PasswordInput, Segmented, StrengthMeter } from "@/components/ui";

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
  const [forgot, setForgot] = useState(false);

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/connexion/nouveau-mot-de-passe`,
    });
    setLoading(false);
    if (err && /rate|too many/i.test(err.message)) return setError("Trop de demandes. Réessaie dans quelques minutes.");
    // Message identique que le compte existe ou non : on ne révèle pas les adresses inscrites.
    setNotice("Si un compte existe avec cet e-mail, tu vas recevoir un lien pour choisir un nouveau mot de passe. Regarde aussi dans les courriers indésirables.");
  }

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
            setError("Impossible de créer ce compte. Si tu en as déjà un, connecte-toi ou choisis « Mot de passe oublié ».");
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
            "Ton compte est créé. Ouvre l'e-mail que nous venons d'envoyer pour le confirmer."
          );
          setLoading(false);
          return;
        }

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        setNotice("Ton compte est créé. Tu peux te connecter.");
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
            setError("E-mail ou mot de passe incorrect.");
          } else if (/email not confirmed/i.test(signInError.message)) {
            setError("Ton e-mail n'est pas encore confirmé. Regarde dans ta boîte de réception.");
          } else {
            setError(signInError.message);
          }
          setLoading(false);
          return;
        }

        if (signInData.session) {
          window.location.href = "/app";
        } else {
          setError("La connexion n'a pas marché. Réessaie.");
          setLoading(false);
        }
      }
    } catch (err: unknown) {
      console.error("[Auth] Exception:", err);
      setError(err instanceof Error ? err.message : "La connexion n'a pas marché. Réessaie.");
      setLoading(false);
    }
  }

  const isSignup = mode === "inscription";
  function switchMode(m: "connexion" | "inscription") {
    setMode(m);
    setForgot(false);
    setError(null);
    setNotice(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
          <Link href="/" aria-label="PHAR, accueil" className="flex min-h-12 items-center">
            <Logo />
          </Link>
          <Link href="/" className="flex min-h-12 items-center px-2 text-sm text-muted hover:text-ink">
            Retour
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:py-14">
        {forgot ? (
          <>
            <h1 className="text-[32px] font-semibold leading-[1.15] text-ink">Mot de passe oublié</h1>
            <p className="mt-2 text-lg text-muted">Entre ton e-mail, nous t&apos;envoyons un lien pour en choisir un nouveau.</p>
            {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">{error}</p>}
            {notice && <p role="status" className="mt-6 rounded-xl bg-sage-50 px-4 py-3 text-sm text-sage-700 ring-1 ring-sage/30">{notice}</p>}
            <form onSubmit={handleForgot} className="mt-8 space-y-4">
              <Input label="E-mail" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button variant="accent" type="submit" loading={loading} className="!mt-8 w-full min-h-[52px] text-base">
                Recevoir le lien
              </Button>
            </form>
            <p className="mt-6 text-center">
              <button type="button" onClick={() => switchMode("connexion")} className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline underline-offset-4">
                Retour à la connexion
              </button>
            </p>
          </>
        ) : (
        <>
        <h1 className="text-[32px] font-semibold leading-[1.15] text-ink">{isSignup ? "Créer mon compte" : "Connexion"}</h1>
        <p className="mt-2 text-lg text-muted">{isSignup ? "C'est gratuit. Le reste de ton profil se complète plus tard." : "Avec ton e-mail et ton mot de passe."}</p>

        {error && (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-6 rounded-xl bg-sage-50 px-4 py-3 text-sm text-sage-700 ring-1 ring-sage/30">
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {isSignup && (
            <>
              <Segmented
                label="Je viens pour"
                value={role}
                onChange={setRole}
                options={[
                  { id: "jeune", label: "Travailler" },
                  { id: "entreprise", label: "Recruter" },
                  { id: "mentor", label: "Aider" },
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Prénom" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input label="Nom" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <Input label="Ville" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex. Lomé" />
            </>
          )}
          <Input label="E-mail" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordInput
            label="Mot de passe"
            required
            minLength={6}
            autoComplete={isSignup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint={isSignup ? <StrengthMeter password={password} /> : undefined}
          />
          {!isSignup && (
            <button
              type="button"
              onClick={() => { setForgot(true); setError(null); setNotice(null); }}
              className="-mt-1 inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4 hover:text-ink"
            >
              Mot de passe oublié ?
            </button>
          )}
          <Button variant="accent" type="submit" loading={loading} className="!mt-8 w-full min-h-[52px] text-base">
            {loading ? "Un instant…" : isSignup ? "Créer mon compte" : "Me connecter"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isSignup ? "Tu as déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <button type="button" onClick={() => switchMode(isSignup ? "connexion" : "inscription")} className="inline-flex min-h-11 items-center font-medium text-ink underline underline-offset-4">
            {isSignup ? "Me connecter" : "Créer un compte"}
          </button>
        </p>
        </>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-muted">© {new Date().getFullYear()} PHAR</footer>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AuthFormContent />
    </Suspense>
  );
}
