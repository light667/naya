"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { Logo, Spinner } from "@/components/ui";
import { Icon } from "@/components/icons";
import { supabase } from "@/lib/supabase";

type Role = "talent" | "recruteur" | "admin";
type Item = { href: string; label: string; icon: () => React.ReactElement; roles: Role[] };

const NAV: Item[] = [
  { href: "/app", label: "Accueil", icon: Icon.home, roles: ["talent", "recruteur", "admin"] },
  { href: "/app/opportunites", label: "Missions", icon: Icon.search, roles: ["talent", "recruteur", "admin"] },
  { href: "/app/candidatures", label: "Suivi", icon: Icon.track, roles: ["talent", "admin"] },
  { href: "/app/assistant", label: "Assistante", icon: Icon.spark, roles: ["talent", "admin"] },
  { href: "/app/profil", label: "Profil", icon: Icon.user, roles: ["talent", "admin"] },
  { href: "/app/publier", label: "Mes offres", icon: Icon.plus, roles: ["recruteur", "admin"] },
  { href: "/app/moderation", label: "Modération", icon: Icon.shield, roles: ["admin"] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) router.replace("/connexion");
  }, [loading, session, router]);

  if (loading || !session || !profile) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <Logo />
        {!loading && session && !profile ? (
          <p className="max-w-xs text-center text-sm text-muted">Profil introuvable. Vérifiez que le script de base de données a bien été exécuté dans Supabase.</p>
        ) : (
          <Spinner className="text-plum" />
        )}
      </div>
    );
  }

  // Le parcours de découverte s'affiche en plein écran, sans navigation
  if (pathname.startsWith("/app/decouverte")) return <>{children}</>;

  const items = NAV.filter((i) => i.roles.includes(profile.role));
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));
  const initials = (profile.full_name || session.user.email || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-dvh lg:flex">
      {/* Barre latérale (ordinateur) */}
      <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col px-5 py-6 lg:flex">
        <Link href="/app" className="px-3"><Logo /></Link>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {items.map((i) => {
            const active = isActive(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`relative flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-semibold transition-colors ${active ? "text-white" : "text-muted hover:text-plum"}`}
              >
                {active && <motion.span layoutId="nav-desktop" className="absolute inset-0 rounded-2xl bg-plum" transition={{ type: "spring", stiffness: 480, damping: 38 }} />}
                <span className="relative"><i.icon /></span>
                <span className="relative">{i.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-line">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-plum-100 text-sm font-bold text-plum">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{profile.full_name || session.user.email}</p>
            <p className="text-[13px] text-muted">{profile.role === "talent" ? "Talent" : profile.role === "recruteur" ? "Recruteur" : "Administratrice"}</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} aria-label="Se déconnecter" className="rounded-full p-2 text-muted hover:bg-plum-50 hover:text-plum">
            <Icon.logout />
          </button>
        </div>
      </aside>

      {/* En-tête mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-bg/85 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/app"><Logo /></Link>
        <button onClick={() => supabase.auth.signOut()} aria-label="Se déconnecter" className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted hover:bg-plum-50 hover:text-plum">
          <Icon.logout /> Quitter
        </button>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-4 sm:px-6 lg:px-10 lg:pb-16 lg:pt-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation basse (mobile) */}
      <nav className="fixed inset-x-3 bottom-3 z-30 flex rounded-[26px] bg-white/95 p-1.5 shadow-[0_16px_40px_-16px_rgba(74,21,75,0.4)] ring-1 ring-line backdrop-blur-md lg:hidden" aria-label="Navigation principale">
        {items.map((i) => {
          const active = isActive(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[20px] py-2 text-[11px] font-semibold transition-colors ${active ? "text-white" : "text-muted"}`}
            >
              {active && <motion.span layoutId="nav-mobile" className="absolute inset-0 rounded-[20px] bg-plum" transition={{ type: "spring", stiffness: 480, damping: 36 }} />}
              <span className="relative"><i.icon /></span>
              <span className="relative truncate">{i.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
