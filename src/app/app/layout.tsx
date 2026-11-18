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
    { label: "Mon Cap", href: "/app" },
    { label: "Opportunités", href: "/opportunites" },
    { label: "Mes Formations", href: "/formations" },
    { label: "Assistant IA", href: "/assistant-ia" },
    { label: "Équipage", href: "/communaute" },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const displayName = profile?.full_name || session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "Mon Profil";
  const displayRole = profile?.headline || "Talent émergent";

  return (
    <div className="min-h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C]">
      {/* NAVBAR DASHBOARD */}
      <header className="bg-white border-b border-[#E2ECF2] sticky top-0 z-40">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 h-18 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/img/logo_phar_trimmed.png"
                alt="PHAR"
                width={130}
                height={42}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-1 text-sm font-bold transition-colors ${
                      isActive ? "text-[#0A2A5C]" : "text-[#536B88] hover:text-[#0A2A5C]"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FFB81C] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* USER WIDGET AVEC DÉCONNEXION */}
          <div className="flex items-center gap-4">
            <Link href="/profil" className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-extrabold text-[#0A2A5C] group-hover:text-[#22C3C9] transition-colors truncate max-w-[160px]">
                  {displayName}
                </div>
                <div className="text-xs text-[#536B88] truncate max-w-[160px]">{displayRole}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#22C3C9]/15 border-2 border-[#22C3C9] flex items-center justify-center text-sm font-extrabold text-[#129aa0]">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </Link>

            {session && (
              <button
                onClick={handleSignOut}
                title="Se déconnecter"
                className="text-xs font-bold text-[#536B88] hover:text-red-600 px-2 py-1 rounded-lg border border-[#E2ECF2] hover:border-red-200 transition-colors"
              >
                Sortir
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENU */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 lg:px-12 py-8">
        {children}
      </main>

      <footer className="text-center py-6 text-xs text-[#536B88] border-t border-[#E2ECF2] bg-white">
        Plateforme PHAR — Inclusion &amp; Employabilité des Jeunes
      </footer>
    </div>
  );
}
