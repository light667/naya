"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo, Spinner } from "@/components/ui";
import { PortfolioView, type PortfolioData } from "@/components/portfolio/PortfolioView";
import { supabase } from "@/lib/supabase";

type Full = PortfolioData & { owner?: boolean; is_public?: boolean };

export function PublicPortfolio({ slug, initial }: { slug: string; initial: Full | null }) {
  const params = useSearchParams();
  const [data, setData] = useState<Full | null>(initial);
  const [checking, setChecking] = useState(!initial);

  useEffect(() => {
    if (initial) return;
    supabase.rpc("get_portfolio", { p_slug: slug }).then(({ data }) => { setData((data as Full) ?? null); setChecking(false); });
  }, [initial, slug]);

  useEffect(() => {
    if (data && params.get("print") === "1") {
      const t = setTimeout(() => window.print(), 900);
      return () => clearTimeout(t);
    }
  }, [data, params]);

  if (checking) return <div className="flex min-h-dvh items-center justify-center"><Spinner className="text-plum" /></div>;

  if (!data) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <Logo />
        <h1 className="font-display text-[32px] text-plum">Portfolio indisponible</h1>
        <p className="max-w-sm text-muted">Ce portfolio n&apos;existe pas ou son partage est désactivé pour le moment.</p>
        <Link href="/" className="font-semibold text-plum underline">Découvrir PHAR</Link>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-bg">
      {data.owner && !data.is_public && (
        <p className="bg-sun px-4 py-2 text-center text-sm font-semibold text-night print:hidden">
          Aperçu privé : seule vous voyez cette page. <Link href="/app/profil?tab=portfolio" className="underline">Activer le partage</Link>
        </p>
      )}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <PortfolioView data={data} />
        <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-sm text-muted print:hidden">
          <Link href="/"><Logo /></Link>
          <span>Portfolio créé avec PHAR</span>
          <button onClick={() => window.print()} className="font-semibold text-plum hover:underline">Télécharger en PDF</button>
        </footer>
      </div>
    </main>
  );
}
