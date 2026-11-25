"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export const NAV_LINKS = [
  { label: "Offres", href: "/opportunites" },
  { label: "Formations", href: "/formations" },
  { label: "Assistant", href: "/assistant-ia" },
  { label: "Réseau", href: "/communaute" },
];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

/** En-tête unique : logo, liens (ordinateur), une seule action. Sur mobile, la navigation passe dans la barre du bas. */
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, profile } = useAuth();
  const firstName = (profile?.full_name || "").trim().split(/\s+/)[0];

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={session ? "/app" : "/"} aria-label="PHAR, accueil" className="flex min-h-12 items-center">
            <Logo />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(pathname, l.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive(pathname, l.href) ? "font-semibold text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {session ? (
            <div className="flex items-center gap-1">
              <Link href="/profil" className="flex min-h-12 items-center gap-2 rounded-xl px-2 text-sm text-ink hover:bg-slate-100">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-ink ring-1 ring-line">
                  {(firstName[0] || "?").toUpperCase()}
                </span>
                <span className="hidden font-medium sm:inline">{firstName || "Mon profil"}</span>
              </Link>
              <button
                onClick={signOut}
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className="flex h-12 w-12 items-center justify-center rounded-xl text-muted transition-colors hover:bg-slate-100 hover:text-ink"
              >
                <Icon.logout />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/connexion" className="flex min-h-12 items-center rounded-xl px-3 text-sm font-medium text-ink hover:bg-slate-100">
                Connexion
              </Link>
              <Link
                href="/connexion?mode=inscription"
                className="hidden min-h-11 items-center rounded-xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-line transition-colors hover:bg-slate-50 md:inline-flex"
              >
                Créer mon compte
              </Link>
            </div>
          )}
        </div>
      </header>
      <TabBar />
    </>
  );
}

const TABS = [
  { label: "Accueil", href: "/", authHref: "/app", icon: Icon.home },
  { label: "Offres", href: "/opportunites", icon: Icon.briefcase },
  { label: "Assistant", href: "/assistant-ia", icon: Icon.chat },
  { label: "Formations", href: "/formations", icon: Icon.book },
  { label: "Réseau", href: "/communaute", icon: Icon.people },
  { label: "Profil", href: "/profil", icon: Icon.user },
];

/** Barre fixe en bas de l'écran sur mobile. */
export function TabBar() {
  const pathname = usePathname();
  const { session } = useAuth();
  return (
    <nav
      aria-label="Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-6">
        {TABS.map((t) => {
          const href = session && t.authHref ? t.authHref : t.href;
          const active = t.href === "/" ? pathname === "/" || pathname === "/app" : isActive(pathname, t.href);
          const I = t.icon;
          return (
            <li key={t.label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[12px] leading-none transition-colors ${
                  active ? "font-semibold text-sun" : "text-muted"
                }`}
              >
                <I />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
