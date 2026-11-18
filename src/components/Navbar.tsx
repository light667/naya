"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Opportunités", href: "/opportunites" },
    { label: "Formations", href: "/formations" },
    { label: "Assistant IA", href: "/assistant-ia" },
    { label: "Communauté", href: "/communaute" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2F2F5] transition-all">
      <div className="max-w-[1360px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* LOGO PHAR OFFICIEL */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/img/logo_phar_trimmed.png"
            alt="PHAR Logo Officiel"
            width={160}
            height={52}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-[15px] font-semibold transition-colors ${
                  isActive ? "text-[#0A2A5C] font-bold" : "text-[#0A2A5C]/80 hover:text-[#22C3C9]"
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

        {/* CTA ACTIONS */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/connexion"
            className="text-[15px] font-bold text-[#0A2A5C] hover:text-[#22C3C9] px-3 py-2 transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/connexion?mode=inscription"
            className="inline-flex items-center justify-center bg-[#FFB81C] text-[#0A2A5C] font-extrabold text-[15px] px-6 py-2.5 rounded-xl shadow-[0_4px_14px_rgba(255,184,28,0.35)] hover:bg-[#ffc138] hover:-translate-y-0.5 transition-all"
          >
            Rejoindre
          </Link>
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
        <div className="md:hidden bg-white border-b border-[#E2F2F5] px-6 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-2 text-[15px] font-bold text-[#0A2A5C]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#E2F2F5] flex flex-col gap-2">
            <Link
              href="/connexion"
              onClick={() => setMobileOpen(false)}
              className="text-center py-2 text-[15px] font-bold text-[#0A2A5C]"
            >
              Connexion
            </Link>
            <Link
              href="/connexion?mode=inscription"
              onClick={() => setMobileOpen(false)}
              className="text-center bg-[#FFB81C] text-[#0A2A5C] font-extrabold py-2.5 rounded-xl shadow-sm"
            >
              Rejoindre
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
