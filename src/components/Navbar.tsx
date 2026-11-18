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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/img/logo_phar_trimmed.png"
            alt="PHAR"
            width={120}
            height={38}
            className="h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
            priority
          />
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 px-2 py-1 rounded-full border border-slate-200/70">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                  isActive
                    ? "bg-white text-slate-950 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS : VISIBLE SUR ORDINATEUR ET MOBILE */}
        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/app"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 text-white font-semibold text-[10px] flex items-center justify-center">
                  {userInitial}
                </div>
                <span>Mon Espace</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="hidden sm:inline-block text-xs text-slate-500 hover:text-red-600 font-medium px-2 py-1 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/connexion"
                className="inline-flex items-center justify-center text-xs font-semibold text-slate-800 hover:text-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 sm:bg-transparent sm:border-transparent transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/connexion?mode=inscription"
                className="hidden sm:inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-xs transition-all hover:shadow-sm"
              >
                Commencer
              </Link>
            </div>
          )}

          {/* BURGER MOBILE */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-900 focus:outline-none"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-2 shadow-lg animate-in fade-in duration-150">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`py-2 text-sm font-medium transition-colors ${
                pathname === link.href ? "text-slate-950 font-semibold" : "text-slate-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {session ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="text-left text-red-600 font-medium py-1.5 text-xs"
              >
                Déconnexion
              </button>
            ) : (
              <Link
                href="/connexion?mode=inscription"
                onClick={() => setMobileOpen(false)}
                className="text-center bg-slate-900 text-white font-medium py-2.5 rounded-lg text-xs"
              >
                Créer un compte
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
