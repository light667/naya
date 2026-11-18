import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-[#0A2A5C]">
      {/* FAISCEAU LUMINEUX DU PHARE (Balayage animé doux) */}
      <div className="lighthouse-beam" aria-hidden />

      {/* 1. NAVBAR ÉLÉGANTE */}
      <Navbar />

      {/* 2. HERO PLEIN ÉCRAN */}
      <section className="relative min-h-[82vh] flex items-center overflow-hidden bg-[#F7FBFC]">
        {/* Photo de fond marché à droite */}
        <div className="absolute top-0 right-0 w-full lg:w-[56%] h-full z-0">
          <Image
            src="/img/hero.jpg"
            alt="Marché local et talents en activité"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Voile blanc dégradé */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/95 lg:via-white/90 lg:to-transparent" />

        <div className="relative z-20 max-w-[1320px] mx-auto px-6 lg:px-12 py-16 w-full">
          <div className="max-w-[620px]">
            {/* Tag cap */}
            <div className="inline-flex items-center gap-2 bg-[#22C3C9]/15 text-[#0A2A5C] px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-[#22C3C9]" />
              Inclusion &amp; Employabilité
            </div>

            {/* Slogan officiel en très grande typographie */}
            <h1 className="font-display text-[42px] sm:text-[58px] lg:text-[68px] leading-[1.05] text-[#0A2A5C] uppercase mb-6">
              TON AVENIR A UN{" "}
              <span className="relative inline-block text-[#0A2A5C] px-1 z-10 after:absolute after:bottom-2 after:left-0 after:-z-10 after:h-2/5 after:w-full after:bg-[#FFB81C] after:rounded-md">
                CAP
              </span>
              .<br />
              <span className="text-[#22C3C9]">PHAR L&apos;ÉCLAIRE.</span>
            </h1>

            {/* Sous-titre court et percutant */}
            <p className="text-base sm:text-lg text-[#536B88] font-medium leading-relaxed mb-8 max-w-[500px]">
              Révèle tes talents, développe tes compétences et rejoins les opportunités vérifiées qui t&apos;attendent.
            </p>

            {/* 2 Boutons principaux */}
            <div className="flex flex-wrap items-center gap-3.5 mb-8">
              <Link
                href="/connexion?mode=inscription"
                className="inline-flex items-center gap-2 bg-[#0A2A5C] text-white font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-xl shadow-sm hover:bg-[#0d3470] hover:-translate-y-0.5 transition-all"
              >
                Trouver mon cap
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/opportunites"
                className="inline-flex items-center gap-2 bg-white text-[#0A2A5C] font-extrabold text-sm sm:text-base px-7 py-3.5 rounded-xl border-2 border-[#0A2A5C] hover:bg-[#EFFAFB] hover:-translate-y-0.5 transition-all"
              >
                Explorer les offres
              </Link>
            </div>

            {/* Social proof épuré */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#0A2A5C]/10">
              <div className="flex -space-x-2">
                <Image src="/img/accueil.jpg" alt="Talent" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                <Image src="/img/artisane.jpg" alt="Talent" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                <Image src="/img/bureau.jpg" alt="Talent" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                <Image src="/img/vendeuse.jpg" alt="Talent" width={32} height={32} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
              </div>
              <p className="text-xs font-bold text-[#0A2A5C]">
                Ouvert à tous les jeunes talents et recruteurs partenaires
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VAGUE TURQUOISE PÂLE & BANDEAU DE 5 PHOTOS */}
      <div className="w-full overflow-hidden leading-none bg-[#F7FBFC]">
        <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" className="w-full h-12 block">
          <path d="M0,20 C320,50 520,0 840,25 C1120,50 1320,10 1440,22 L1440,48 L0,48 Z" fill="#EFFAFB" />
        </svg>
      </div>

      <section className="bg-[#EFFAFB] px-6 lg:px-12 py-6 pb-12">
        <div className="max-w-[1360px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="relative h-56 rounded-2xl overflow-hidden shadow-xs group">
            <Image src="/img/couture.jpg" alt="Couture" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-x-2.5 bottom-2.5 bg-white/95 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A2A5C]">
              Confection Wax
            </div>
          </div>

          <div className="relative h-56 rounded-2xl overflow-hidden shadow-xs group">
            <Image src="/img/tissus.jpg" alt="Tissus Wax" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-x-2.5 bottom-2.5 bg-white/95 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A2A5C]">
              Design Textile
            </div>
          </div>

          <div className="relative h-56 rounded-2xl overflow-hidden shadow-xs group">
            <Image src="/img/marche.jpg" alt="Marché" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-x-2.5 bottom-2.5 bg-white/95 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A2A5C]">
              Commerce &amp; Vente
            </div>
          </div>

          <div className="relative h-56 rounded-2xl overflow-hidden shadow-xs group">
            <Image src="/img/artisane.jpg" alt="Artisanat" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-x-2.5 bottom-2.5 bg-white/95 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A2A5C]">
              Artisanat d&apos;Art
            </div>
          </div>

          <div className="relative h-56 rounded-2xl overflow-hidden shadow-xs group col-span-2 sm:col-span-1">
            <Image src="/img/farine.jpg" alt="Agro-transformation" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-x-2.5 bottom-2.5 bg-white/95 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A2A5C]">
              Agro-transformation
            </div>
          </div>
        </div>
      </section>

      {/* 4. LES UNIVERS DE PHAR (Composition claire et épurée) */}
      <section className="max-w-[1320px] mx-auto px-6 lg:px-12 py-16 bg-white">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#22C3C9] mb-2 block">
            Écosystème
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-[#0A2A5C] font-extrabold">
            LES QUATRE UNIVERS DE PHAR
          </h2>
        </div>

        {/* Grille asymétrique épurée */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5">
          {/* CARTE 1 : BOUSSOLE */}
          <Link
            href="/assistant-ia"
            className="group relative h-[360px] lg:h-full min-h-[380px] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-end transition-all hover:shadow-md"
          >
            <Image
              src="/img/accueil.jpg"
              alt="Boussole PHAR"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="relative z-10 p-6 sm:p-8 bg-gradient-to-t from-[#129aa0] via-[#22C3C9]/90 to-transparent text-white flex items-end justify-between">
              <div>
                <h3 className="font-display text-2xl font-extrabold mb-1">Boussole</h3>
                <p className="text-sm opacity-95">
                  Révèle tes talents et savoir-faire avec l&apos;assistant IA.
                </p>
              </div>
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg shrink-0 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </Link>

          {/* COLONNE DE 3 CARTES */}
          <div className="flex flex-col gap-4">
            {/* CARTE 2 : CAP FORMATION */}
            <Link
              href="/formations"
              className="group relative h-36 sm:h-40 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end transition-all hover:shadow-md"
            >
              <Image
                src="/img/cafe.jpg"
                alt="Cap Formation"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="relative z-10 px-6 py-4 bg-gradient-to-t from-[#f5ad0f] via-[#FFB81C]/95 to-transparent text-[#0A2A5C] flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-extrabold">Cap Formation</h3>
                  <p className="text-xs opacity-90">Formations pratiques et certifiantes de terrain.</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#0A2A5C]/10 flex items-center justify-center font-bold shrink-0 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>

            {/* CARTE 3 : HORIZON EMPLOI */}
            <Link
              href="/opportunites"
              className="group relative h-36 sm:h-40 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end transition-all hover:shadow-md"
            >
              <Image
                src="/img/bureau.jpg"
                alt="Horizon Emploi"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="relative z-10 px-6 py-4 bg-gradient-to-t from-[#061938] via-[#0A2A5C]/90 to-transparent text-white flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-extrabold">Horizon Emploi</h3>
                  <p className="text-xs opacity-90">Stages tremplins, contrats et missions vérifiées.</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold shrink-0 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>

            {/* CARTE 4 : ÉQUIPAGE */}
            <Link
              href="/communaute"
              className="group relative h-36 sm:h-40 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-end transition-all hover:shadow-md"
            >
              <Image
                src="/img/recruteur.jpg"
                alt="Équipage"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="relative z-10 px-6 py-4 bg-gradient-to-t from-white via-white/95 to-transparent text-[#0A2A5C] flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-extrabold">Équipage</h3>
                  <p className="text-xs text-[#536B88]">Réseau d&apos;entraide et mentors artisans.</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-[#0A2A5C]/10 flex items-center justify-center font-bold shrink-0 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SECTION IA (PHAR IA) - ÉPURÉE ET DIRECTE */}
      <section className="bg-[#FAFEFF] py-16 px-6 lg:px-12 border-y border-[#E2ECF2]">
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#22C3C9] mb-2 block">
              Orientation Intelligente
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#0A2A5C] mb-4">
              L&apos;ASSISTANT QUI VALORISE TES SAVOIR-FAIRE
            </h2>
            <p className="text-sm sm:text-base text-[#536B88] mb-8 leading-relaxed">
              Discute simplement avec le guide PHAR pour transformer tes expériences pratiques en compétences reconnues.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#EFFAFB] text-[#22C3C9] border border-[#22C3C9] flex items-center justify-center font-extrabold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0A2A5C]">Échange naturel</h4>
                  <p className="text-xs text-[#536B88]">Parle de ton atelier, de tes créations ou de tes projets sans formalisme.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#EFFAFB] text-[#22C3C9] border border-[#22C3C9] flex items-center justify-center font-extrabold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0A2A5C]">Compétences révélées</h4>
                  <p className="text-xs text-[#536B88]">Coupe, vente, maroquinerie, gestion : chaque savoir-faire est valorisé.</p>
                </div>
              </div>

              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#EFFAFB] text-[#22C3C9] border border-[#22C3C9] flex items-center justify-center font-extrabold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0A2A5C]">Recommandations sur mesure</h4>
                  <p className="text-xs text-[#536B88]">Accède aux formations et opportunités adaptées à ton profil.</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/assistant-ia"
                className="inline-flex items-center gap-2 bg-[#22C3C9] hover:bg-[#129aa0] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-colors"
              >
                Lancer mon diagnostic →
              </Link>
            </div>
          </div>

          <div className="relative h-[360px] lg:h-[420px] rounded-3xl overflow-hidden shadow-sm">
            <Image
              src="/img/mentor.jpg"
              alt="Orientation PHAR"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 6. APPEL À L'ACTION FINAL (CTA) ÉPURÉ */}
      <section className="max-w-[1320px] mx-auto px-6 lg:px-12 my-12">
        <div className="relative rounded-3xl overflow-hidden shadow-sm p-8 sm:p-14 text-center">
          <div className="absolute inset-0 z-0">
            <Image src="/img/equipe.jpg" alt="Équipe" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#FFB81C]/90 to-[#22C3C9]/90" />
          
          <div className="relative z-20 max-w-xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl text-[#0A2A5C] font-extrabold leading-snug mb-6">
              « TON AVENIR A UN CAP. PHAR L&apos;ÉCLAIRE. »
            </h2>
            <Link
              href="/connexion?mode=inscription"
              className="inline-flex items-center gap-2 bg-[#0A2A5C] text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-sm hover:bg-[#0d3470] hover:-translate-y-0.5 transition-all"
            >
              Créer mon compte
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <Footer />
    </div>
  );
}
