"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/80 pt-14 pb-10 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          
          {/* MARQUE & MISSION */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/img/logo_phar_trimmed.png"
                alt="PHAR"
                width={110}
                height={34}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Plateforme d&apos;insertion professionnelle et d&apos;autonomisation économique des jeunes talents.
              Valorisation de chaque parcours, y compris des compétences acquises sur le terrain.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span>Afrique de l&apos;Ouest &amp; Centrale</span>
              <span>•</span>
              <span>Accès inclusif</span>
            </div>
          </div>

          {/* LIENS PLATEFORME */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-900 mb-3.5">
              Plateforme
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/opportunites" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Opportunités vérifiées
                </Link>
              </li>
              <li>
                <Link href="/formations" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Formations pratiques
                </Link>
              </li>
              <li>
                <Link href="/assistant-ia" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Assistant IA Carrière
                </Link>
              </li>
              <li>
                <Link href="/communaute" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Communauté &amp; Entraide
                </Link>
              </li>
            </ul>
          </div>

          {/* LIENS COMPTE */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-900 mb-3.5">
              Espaces
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/connexion" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Connexion talent
                </Link>
              </li>
              <li>
                <Link href="/connexion?mode=inscription" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/connexion?mode=inscription&role=entreprise" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Espace Entreprise
                </Link>
              </li>
              <li>
                <Link href="/app" className="text-slate-600 hover:text-slate-900 transition-colors">
                  Tableau de bord
                </Link>
              </li>
            </ul>
          </div>

          {/* SÉCURITÉ & ENGAGEMENT */}
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-wider text-slate-900 mb-3.5">
              Confiance &amp; Éthique
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Toutes les opportunités sont modérées avant publication. Aucun frais de dossier n&apos;est jamais exigé des candidats.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Missions 100% vérifiées
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} PHAR / NAYA. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-500">Conçu pour l&apos;impact et l&apos;inclusion</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
