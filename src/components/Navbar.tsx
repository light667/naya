"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session, profile } = useAuth();

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Opportunités", href: "/opportunites" },
    { label: "Formations", href: "/formations" },
    { label: "Assistant IA", href: "/assistant-ia" },
    { label: "Communauté", href: "/communaute" },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const userInitial = profile?.full_name ? profile.full_name[0].toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2F2F5] transition-all">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        
        {/* LOGO PHAR */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/img/logo_phar_trimmed.png"
            alt="PHAR"
            width={140}
            height={44}
            className="h-10 sm:h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm font-semibold transition-colors ${
                  isActive ? "text-[#0A2A5C] font-bold" : "text-[#536B88] hover:text-[#0A2A5C]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#FFB81C] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA ACTIONS OU PROFIL UTILISATEUR */}
        <div className="hidden sm:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/app"
                className="flex items-center gap-2 bg-[#EFFAFB] hover:bg-[#E2ECF2] px-3.5 py-1.5 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#0A2A5C] text-white font-extrabold text-xs flex items-center justify-center">
                  {userInitial}
                </div>
                <span className="text-xs font-bold text-[#0A2A5C]">Mon Espace</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs text-[#536B88] hover:text-red-600 font-semibold px-2 py-1 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/connexion"
                className="text-xs font-bold text-[#0A2A5C] hover:text-[#22C3C9] px-3 py-2 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/connexion?mode=inscription"
                className="inline-flex items-center justify-center bg-[#FFB81C] hover:bg-[#ffc138] text-[#0A2A5C] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all"
              >
                Rejoindre
              </Link>
            </>
          )}
        </div>

        {/* BURGER MOBILE */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[#0A2A5C] hover:text-[#22C3C9] focus:outline-none"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#E2F2F5] px-6 py-4 flex flex-col gap-2.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-1.5 text-sm font-bold text-[#0A2A5C]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#E2F2F5] flex flex-col gap-2">
            {session ? (
              <>
                <Link
                  href="/app"
                  onClick={() => setMobileOpen(false)}
                  className="text-center bg-[#EFFAFB] text-[#0A2A5C] font-bold py-2 rounded-xl text-xs"
                >
                  Mon Espace
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  className="text-center text-red-600 font-bold py-1.5 text-xs"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 text-xs font-bold text-[#0A2A5C]"
                >
                  Connexion
                </Link>
                <Link
                  href="/connexion?mode=inscription"
                  onClick={() => setMobileOpen(false)}
                  className="text-center bg-[#FFB81C] text-[#0A2A5C] font-extrabold py-2.5 rounded-xl text-xs shadow-xs"
                >
                  Rejoindre
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
