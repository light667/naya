"use client";

import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-slate-200">
      <Navbar />

      {/* HERO SECTION ÉPURÉE & IMPACTANTE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* TEXTE PRINCIPAL */}
            <div className="lg:col-span-7 space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                Inclusion &amp; Insertion Professionnelle
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1]">
                Révèle tes talents.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-sky-800 to-slate-900">
                  Accède à ton avenir.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
                Chaque compétence que tu as apprise — en atelier, au marché, sur le tas ou à l&apos;école — a une réelle valeur.
                PHAR traduit ton expérience en compétences certifiées et te connecte aux opportunités vérifiées.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/assistant-ia"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-xs transition-all hover:shadow-sm"
                >
                  Révéler mes compétences
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/opportunites"
                  className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm px-6 py-3.5 rounded-xl border border-slate-200 transition-all shadow-2xs"
                >
                  Explorer les opportunités
                </Link>
              </div>

              {/* GARANTIES */}
              <div className="pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-4 text-xs text-slate-500">
                <div>
                  <strong className="block text-slate-900 font-bold text-sm">100% Vérifié</strong>
                  <span>Missions modérées</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold text-sm">0 Frais</strong>
                  <span>Gratuit pour les talents</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold text-sm">IA Éthique</strong>
                  <span>Valorise le terrain</span>
                </div>
              </div>
            </div>

            {/* APERÇU VISUEL MINIMALISTE */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg bg-white p-2">
                <div className="relative h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-100">
                  <Image
                    src="/img/hero.jpg"
                    alt="Talent en activité"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  {/* CARTE DE PRÉSENTATION DES CAPACITÉS */}
                  <div className="absolute bottom-4 inset-x-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-100 shadow-sm text-slate-900">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">Valorisation des compétences</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        Système actif
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">Identification des acquis de terrain et mise en relation</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-700">Coupe &amp; Confection</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-700">Commerce &amp; Caisse</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-700">WhatsApp Business</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* LES 4 PILIERS DE LA PLATEFORME */}
      <section className="py-20 bg-slate-50/60 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 block mb-2">
              L&apos;Écosystème PHAR
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Tout ce dont tu as besoin pour avancer
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Un parcours complet sans barrières pour identifier tes forces, te former et trouver ta place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* CARTE 1 */}
            <Link
              href="/assistant-ia"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm mb-4 border border-sky-100">
                  <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-950 transition-colors mb-2">
                  Assistant Carrière IA
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Révèle tes compétences informelles en quelques questions, simule tes entretiens et calibre tes tarifs.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-slate-950">
                <span>Commencer</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* CARTE 2 */}
            <Link
              href="/opportunites"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4 border border-teal-100">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-950 transition-colors mb-2">
                  Opportunités Vérifiées
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Contrats d&apos;apprentissage, stages rémunérés et missions de terrain vérifiés par notre équipe de modération.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-slate-950">
                <span>Explorer les offres</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* CARTE 3 */}
            <Link
              href="/formations"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm mb-4 border border-amber-100">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-950 transition-colors mb-2">
                  Formations Pratiques
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Perfectionne ta technique en atelier (Wax, cuir, gestion de caisse, WhatsApp Business) en format court.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-slate-950">
                <span>Voir le catalogue</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* CARTE 4 */}
            <Link
              href="/communaute"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm mb-4 border border-purple-100">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-slate-950 transition-colors mb-2">
                  Communauté &amp; Entraide
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Échange des astuces d&apos;atelier, trouve des partenaires de confiance et pose tes questions librement.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-slate-950">
                <span>Rejoindre le réseau</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* BANNIÈRE APPEL À L'ACTION FINALE */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Prêt à donner un nouvel élan à ton avenir ?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Rejoins les talents qui valorisent leurs compétences et connecte-toi aux opportunités professionnelles près de chez toi.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/connexion?mode=inscription"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              Créer mon profil gratuitement
            </Link>
            <Link
              href="/connexion?mode=inscription&role=entreprise"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm border border-slate-700 transition-all"
            >
              Espace Recruteur
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
