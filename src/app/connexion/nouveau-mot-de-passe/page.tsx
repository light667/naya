"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button, Logo, PasswordInput, StrengthMeter } from "@/components/ui";

/** Ouverte depuis le lien de réinitialisation reçu par e-mail (Supabase crée une session de récupération). */
export default function NouveauMotDePassePage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => data.session && setReady(true));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Le mot de passe doit faire au moins 6 caractères.");
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(/same|different/i.test(err.message) ? "Choisis un mot de passe différent de l'ancien." : "Le lien a expiré ou n'est plus valable. Demande un nouveau lien.");
    setDone(true);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-md items-center px-4">
          <Link href="/" aria-label="PHAR, accueil" className="flex min-h-12 items-center">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:py-14">
        <h1 className="text-[32px] font-semibold leading-[1.15] text-ink">Nouveau mot de passe</h1>
        {done ? (
          <>
            <p className="mt-2 text-lg text-muted">C&apos;est fait. Ton mot de passe est changé.</p>
            <Link href="/app" className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-sun px-6 text-base font-semibold text-white hover:bg-sun-700">
              Aller à mon espace
            </Link>
          </>
        ) : !ready ? (
          <>
            <p className="mt-2 text-lg text-muted">Ouvre cette page depuis le lien reçu par e-mail. Si le lien a expiré, demandes-en un nouveau.</p>
            <Link href="/connexion" className="mt-8 inline-flex min-h-12 items-center text-sm font-medium text-ink underline underline-offset-4">
              Retour à la connexion
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-lg text-muted">Choisis un mot de passe que tu retiendras.</p>
            {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200">{error}</p>}
            <form onSubmit={submit} className="mt-8 space-y-4">
              <PasswordInput label="Nouveau mot de passe" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint={<StrengthMeter password={password} />} />
              <Button variant="accent" type="submit" loading={loading} className="!mt-8 w-full min-h-[52px] text-base">
                Enregistrer
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
