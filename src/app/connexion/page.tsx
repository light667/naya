"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { Button, Input, Logo } from "@/components/ui";

function AuthForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { session, profile } = useAuth();
  const [mode, setMode] = useState<"connexion" | "inscription">(params.get("mode") === "inscription" ? "inscription" : "connexion");
  const [role, setRole] = useState<"talent" | "recruteur">(params.get("role") === "recruteur" ? "recruteur" : "talent");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !profile) return;
    // Une nouvelle utilisatrice sans compétences commence par la découverte
    router.replace(profile.role === "talent" && profile.skills.length === 0 ? "/app/decouverte" : "/app");
  }, [session, profile, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    if (mode === "inscription") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role }, emailRedirectTo: `${window.location.origin}/app` },
      });
      if (error) setError(traduire(error.message));
      else if (!data.session) setInfo(`Compte créé. Ouvrez le lien envoyé à ${email} pour l'activer, puis connectez-vous.`);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traduire(error.message));
    }
    setLoading(false);
  }

  const isSignup = mode === "inscription";

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-plum-50 p-12 lg:flex">
        <Link href="/"><Logo /></Link>
        <div className="relative z-10 max-w-md">
          <p className="font-display text-[52px] text-plum">Chaque compétence compte, la vôtre aussi.</p>
          <p className="mt-5 text-lg text-muted">
            En cinq questions, NAYA vous aide à mettre des mots sur ce que vous savez déjà faire.
          </p>
        </div>
        <p className="relative z-10 text-sm text-muted">Vos données ne sont jamais vendues ni partagées sans votre accord.</p>
        <motion.div
          aria-hidden
          className="absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full border-[56px] border-plum/[0.07]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </aside>

      <div className="flex flex-col px-4 py-6 sm:px-6">
        <Link href="/" className="lg:hidden"><Logo /></Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              <h1 className="font-display text-[40px] text-plum">{isSignup ? "Créer mon profil" : "Content de vous revoir"}</h1>
              <p className="mt-2 text-muted">{isSignup ? "Gratuit, en moins de deux minutes." : "Connectez-vous pour retrouver vos missions."}</p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {isSignup && (
              <>
                <div className="grid grid-cols-2 rounded-full bg-white p-1 ring-1 ring-line" role="radiogroup" aria-label="Je suis">
                  {(["talent", "recruteur"] as const).map((r) => (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={role === r}
                      key={r}
                      onClick={() => setRole(r)}
                      className={`relative rounded-full px-3 py-2.5 text-sm font-semibold transition-colors ${role === r ? "text-white" : "text-muted hover:text-plum"}`}
                    >
                      {role === r && <motion.span layoutId="role" className="absolute inset-0 rounded-full bg-plum" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                      <span className="relative">{r === "talent" ? "Je cherche des missions" : "Je propose des missions"}</span>
                    </button>
                  ))}
                </div>
                <Input label={role === "recruteur" ? "Votre nom ou celui de votre structure" : "Prénom et nom"} required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
              </>
            )}
            <Input label="Adresse e-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Input
              label="Mot de passe"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              hint={isSignup ? "6 caractères minimum" : undefined}
            />

            <AnimatePresence>
              {(error || info) && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`overflow-hidden rounded-2xl px-4 py-3 text-sm font-medium ${error ? "bg-red-50 text-red-800" : "bg-sage-50 text-sage-700"}`}
                >
                  {error ?? info}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" variant="accent" loading={loading} className="w-full py-4 text-base">
              {isSignup ? "Créer mon profil" : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[15px] text-muted">
            {isSignup ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}{" "}
            <button className="font-semibold text-plum underline-offset-4 hover:underline" onClick={() => { setMode(isSignup ? "connexion" : "inscription"); setError(null); setInfo(null); }}>
              {isSignup ? "Se connecter" : "Créer mon profil"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function traduire(msg: string) {
  if (/invalid login/i.test(msg)) return "E-mail ou mot de passe incorrect. Vérifiez-les puis réessayez.";
  if (/already registered/i.test(msg)) return "Un compte existe déjà avec cette adresse. Connectez-vous plutôt.";
  if (/email not confirmed/i.test(msg)) return "Adresse non confirmée. Ouvrez le lien reçu par e-mail, puis reconnectez-vous.";
  if (/password/i.test(msg)) return "Mot de passe trop court : 6 caractères minimum.";
  return msg;
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
