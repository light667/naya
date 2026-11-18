"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#EFFAFB] relative pt-0">
      {/* Vague douce en haut du footer */}
      <div className="w-full overflow-hidden leading-none bg-white">
        <svg viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none" className="w-full h-12 block">
          <path d="M0,20 C360,45 680,5 1040,30 C1240,42 1380,18 1440,25 L1440,50 L0,50 Z" fill="#EFFAFB" />
        </svg>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          
          {/* MARQUE & MISSION */}
          <div className="space-y-4">
            <Image
              src="/img/logo_phar_trimmed.png"
              alt="PHAR Logo"
              width={160}
              height={52}
              className="h-12 w-auto object-contain"
            />
            <p className="text-[#536B88] text-sm leading-relaxed max-w-sm">
              La plateforme qui éclaire le potentiel des talents africains, valorise chaque parcours et connecte les jeunes aux opportunités d'avenir.
            </p>

            <div className="pt-2">
              <p className="text-xs font-bold text-[#0A2A5C] mb-2 uppercase tracking-wider">
                Reste informé(e) des opportunités
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  placeholder="Ton email"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E2F2F5] bg-white text-sm text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
                />
                <button
                  type="submit"
                  className="bg-[#FFB81C] text-[#0A2A5C] font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-[#ffc138] transition-colors"
                >
                  S'inscrire
                </button>
              </form>
            </div>
          </div>

          {/* COLONNE PLATEFORME */}
          <div>
            <h5 className="font-extrabold text-[#0A2A5C] text-sm uppercase tracking-wider mb-5">
              Plateforme
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/app" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Boussole des Talents
                </Link>
              </li>
              <li>
                <Link href="/formations" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Cap Formation
                </Link>
              </li>
              <li>
                <Link href="/opportunites" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Horizon Emploi
                </Link>
              </li>
              <li>
                <Link href="/communaute" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Équipage Communauté
                </Link>
              </li>
              <li>
                <Link href="/assistant-ia" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Assistant PHAR IA
                </Link>
              </li>
            </ul>
          </div>

          {/* COLONNE RESSOURCES */}
          <div>
            <h5 className="font-extrabold text-[#0A2A5C] text-sm uppercase tracking-wider mb-5">
              Ressources
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/formations" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Fiches Métiers &amp; Savoir-faire
                </Link>
              </li>
              <li>
                <Link href="/communaute" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Événements &amp; Ateliers
                </Link>
              </li>
              <li>
                <Link href="/assistant-ia" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Guide d'orientation
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  FAQ &amp; Aide aux candidats
                </Link>
              </li>
            </ul>
          </div>

          {/* COLONNE PHAR */}
          <div>
            <h5 className="font-extrabold text-[#0A2A5C] text-sm uppercase tracking-wider mb-5">
              PHAR
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Notre Mission
                </Link>
              </li>
              <li>
                <Link href="/connexion?mode=inscription&role=entreprise" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Entreprises Partenaires
                </Link>
              </li>
              <li>
                <Link href="/connexion?mode=inscription&role=mentor" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Devenir Mentor
                </Link>
              </li>
              <li>
                <Link href="/connexion" className="text-[#536B88] hover:text-[#0A2A5C] transition-colors">
                  Contact &amp; Écosystème
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* BAS DU FOOTER */}
        <div className="pt-8 border-t border-[#0A2A5C]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-[#536B88]">
            © 2026 PHAR — Plateforme d'Inclusion &amp; Employabilité des Jeunes. Tous droits réservés.
          </p>
          <p className="text-[#7A91AB] italic">
            Maquette : données fictives de démonstration — PHAR 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
