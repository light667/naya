"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, profile } = useAuth();

  const links = [
    { label: "Tableau de bord", href: "/app" },
    { label: "Opportunités", href: "/opportunites" },
    { label: "Formations", href: "/formations" },
    { label: "Assistant IA", href: "/assistant-ia" },
    { label: "Communauté", href: "/communaute" },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const displayName = profile?.full_name || session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "Mon Profil";
  const displayRole = profile?.headline || "Talent émergent";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* NAVBAR DASHBOARD */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
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

            <nav className="hidden md:flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full border border-slate-200/70">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                      isActive
                        ? "bg-white text-slate-950 font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* USER WIDGET AVEC DÉCONNEXION */}
          <div className="flex items-center gap-3">
            <Link href="/profil" className="flex items-center gap-2.5 group">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition-colors truncate max-w-[140px]">
                  {displayName}
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{displayRole}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </Link>

            {session && (
              <button
                onClick={handleSignOut}
                title="Se déconnecter"
                className="text-xs font-medium text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
              >
                Sortir
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200/80 bg-white">
        PHAR / NAYA · Plateforme d&apos;insertion professionnelle et d&apos;autonomisation économique
      </footer>
    </div>
  );
}
