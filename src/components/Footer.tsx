"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#EFFAFB] border-t border-[#E2ECF2] pt-10 pb-8 text-[#0A2A5C]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          
          {/* MARQUE */}
          <div className="space-y-3">
            <Image
              src="/img/logo_phar_trimmed.png"
              alt="PHAR"
              width={130}
              height={42}
              className="h-10 w-auto object-contain"
            />
            <p className="text-xs text-[#536B88] leading-relaxed">
              Inclusion et employabilité des jeunes talents en Afrique.
            </p>
          </div>

          {/* LIENS PLATEFORME */}
          <div>
            <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#0A2A5C] mb-3">
              Plateforme
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/opportunites" className="text-[#536B88] hover:text-[#0A2A5C]">
                  Opportunités
                </Link>
              </li>
              <li>
                <Link href="/formations" className="text-[#536B88] hover:text-[#0A2A5C]">
                  Formations
                </Link>
              </li>
              <li>
                <Link href="/assistant-ia" className="text-[#536B88] hover:text-[#0A2A5C]">
                  Boussole IA
                </Link>
              </li>
              <li>
                <Link href="/communaute" className="text-[#536B88] hover:text-[#0A2A5C]">
                  Équipage
                </Link>
              </li>
            </ul>
          </div>

          {/* LIENS UTILISATEUR */}
          <div>
            <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#0A2A5C] mb-3">
              Compte
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/connexion" className="text-[#536B88] hover:text-[#0A2A5C]">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link href="/connexion?mode=inscription" className="text-[#536B88] hover:text-[#0A2A5C]">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/connexion?mode=inscription&role=entreprise" className="text-[#536B88] hover:text-[#0A2A5C]">
                  Espace Entreprise
                </Link>
              </li>
            </ul>
          </div>

          {/* NEWSLETTER RAPIDE */}
          <div>
            <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#0A2A5C] mb-3">
              Newsletter
            </h5>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Ton email"
                className="w-full px-3 py-2 rounded-xl border border-[#E2ECF2] bg-white text-xs outline-none focus:border-[#22C3C9]"
              />
              <button
                type="submit"
                className="bg-[#FFB81C] text-[#0A2A5C] font-extrabold text-xs px-3 py-2 rounded-xl"
              >
                OK
              </button>
            </form>
          </div>

        </div>

        <div className="pt-6 border-t border-[#E2ECF2] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#536B88] gap-2">
          <span>PHAR © 2026 — Tous droits réservés.</span>
          <span>Ton avenir a un cap. PHAR l&apos;éclaire.</span>
        </div>
      </div>
    </footer>
  );
}
