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
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#F7FBFC]">
        {/* Photo de fond marché à droite */}
        <div className="absolute top-0 right-0 w-full lg:w-[58%] h-full z-0">
          <Image
            src="/img/hero.jpg"
            alt="Marché local et talents en activité"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Voile blanc dégradé de gauche à droite pour lisibilité parfaite */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/95 lg:via-white/90 lg:to-transparent" />

        <div className="relative z-20 max-w-[1320px] mx-auto px-6 lg:px-12 py-20 w-full">
          <div className="max-w-[680px]">
            {/* Tag cap */}
            <div className="inline-flex items-center gap-2.5 bg-[#22C3C9]/15 text-[#0A2A5C] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-[#22C3C9] ring-2 ring-[#22C3C9]/40" />
              Plateforme d'Inclusion &amp; Employabilité
            </div>

            {/* Slogan officiel en très grande typographie */}
            <h1 className="font-display text-[44px] sm:text-[62px] lg:text-[72px] leading-[1.06] text-[#0A2A5C] uppercase mb-6">
              TON AVENIR A UN{" "}
              <span className="relative inline-block text-[#0A2A5C] px-1 z-10 after:absolute after:bottom-2 after:left-0 after:-z-10 after:h-2/5 after:w-full after:bg-[#FFB81C] after:rounded-md">
                CAP
              </span>
              .<br />
              <span className="text-[#22C3C9]">PHAR L'ÉCLAIRE.</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-[#536B88] font-medium leading-relaxed mb-10 max-w-[560px]">
              Révèle tes talents, développe tes compétences et rejoins les opportunités qui t'attendent à l'horizon.
            </p>

            {/* 2 Boutons principaux */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                href="/connexion?mode=inscription"
                className="inline-flex items-center gap-2.5 bg-[#0A2A5C] text-white font-bold text-base px-8 py-4 rounded-2xl shadow-[0_4px_16px_rgba(10,42,92,0.2)] hover:bg-[#0d3470] hover:-translate-y-0.5 transition-all"
              >
                Trouver mon cap
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/opportunites"
                className="inline-flex items-center gap-2 bg-transparent text-[#0A2A5C] font-bold text-base px-8 py-4 rounded-2xl border-2 border-[#0A2A5C] hover:bg-[#0A2A5C]/5 hover:-translate-y-0.5 transition-all"
              >
                Explorer les opportunités
              </Link>
            </div>

            {/* Meta de lancement (sans faux chiffres) */}
            <div className="flex items-center gap-4 pt-6 border-t border-[#0A2A5C]/10">
              <div className="flex -space-x-2.5">
                <Image src="/img/accueil.jpg" alt="Talent" width={38} height={38} className="w-9 h-9 rounded-full object-cover ring-2 ring-white" />
                <Image src="/img/artisane.jpg" alt="Talent" width={38} height={38} className="w-9 h-9 rounded-full object-cover ring-2 ring-white" />
                <Image src="/img/bureau.jpg" alt="Talent" width={38} height={38} className="w-9 h-9 rounded-full object-cover ring-2 ring-white" />
                <Image src="/img/vendeuse.jpg" alt="Talent" width={38} height={38} className="w-9 h-9 rounded-full object-cover ring-2 ring-white" />
              </div>
              <p className="text-sm font-semibold text-[#0A2A5C]">
                <strong className="text-[#22C3C9]">Rejoins les premiers talents</strong> qui prennent le cap vers l'horizon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VAGUE TURQUOISE PÂLE & BANDEAU DE 5 PHOTOS */}
      <div className="w-full overflow-hidden leading-none bg-[#F7FBFC]">
        <svg viewBox="0 0 1440 64" fill="none" preserveAspectRatio="none" className="w-full h-16 block">
          <path d="M0,24 C320,60 520,0 840,32 C1120,60 1320,12 1440,28 L1440,64 L0,64 Z" fill="#EFFAFB" />
        </svg>
      </div>

      <section className="bg-[#EFFAFB] px-6 lg:px-12 py-8 pb-14">
        <div className="max-w-[1360px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm group">
            <Image src="/img/couture.jpg" alt="Couture" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-x-3 bottom-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-[#0A2A5C] flex items-center justify-between">
              <span>Confection &amp; Mode</span>
              <span className="bg-[#FFB81C] text-[#0A2A5C] px-2 py-0.5 rounded-md font-extrabold text-[10px]">Ouvert</span>
            </div>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm group">
            <Image src="/img/tissus.jpg" alt="Tissus Wax" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-x-3 bottom-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-[#0A2A5C] flex items-center justify-between">
              <span>Design Textile</span>
              <span className="bg-[#FFB81C] text-[#0A2A5C] px-2 py-0.5 rounded-md font-extrabold text-[10px]">Ouvert</span>
            </div>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm group">
            <Image src="/img/marche.jpg" alt="Marché" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-x-3 bottom-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-[#0A2A5C] flex items-center justify-between">
              <span>Commerce &amp; Vente</span>
              <span className="bg-[#FFB81C] text-[#0A2A5C] px-2 py-0.5 rounded-md font-extrabold text-[10px]">Ouvert</span>
            </div>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm group">
            <Image src="/img/artisane.jpg" alt="Artisanat" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-x-3 bottom-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-[#0A2A5C] flex items-center justify-between">
              <span>Artisanat Local</span>
              <span className="bg-[#FFB81C] text-[#0A2A5C] px-2 py-0.5 rounded-md font-extrabold text-[10px]">Ouvert</span>
            </div>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden shadow-sm group col-span-2 sm:col-span-1">
            <Image src="/img/farine.jpg" alt="Agro-transformation" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-x-3 bottom-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-[#0A2A5C] flex items-center justify-between">
              <span>Agro-transformation</span>
              <span className="bg-[#FFB81C] text-[#0A2A5C] px-2 py-0.5 rounded-md font-extrabold text-[10px]">Ouvert</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. LES UNIVERS DE PHAR (Composition asymétrique des 4 univers) */}
      <section className="max-w-[1320px] mx-auto px-6 lg:px-12 py-24 bg-white">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#22C3C9] mb-3 block">
            Parcours &amp; Écosystème
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-[#0A2A5C] mb-4">
            LES QUATRE UNIVERS DE PHAR
          </h2>
          <p className="text-[#536B88] text-base sm:text-lg">
            Un itinéraire complet et guidé pour passer de la révélation de tes compétences jusqu'au travail épanouissant.
          </p>
        </div>

        {/* Grille asymétrique : grande carte verticale + 3 cartes */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
          
          {/* CARTE 1 : BOUSSOLE (Grande carte verticale, voile turquoise) */}
          <Link
            href="/app"
            className="group relative h-[480px] lg:h-full min-h-[460px] rounded-[32px] overflow-hidden shadow-md flex flex-col justify-end transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <Image
              src="/img/accueil.jpg"
              alt="Boussole PHAR"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Voile turquoise réglementaire */}
            <div className="relative z-10 p-8 sm:p-10 bg-gradient-to-t from-[#1ab1b7] via-[#22C3C9]/90 to-transparent text-white flex items-end justify-between">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold mb-2">Boussole</h3>
                <p className="text-sm sm:text-base opacity-95 max-w-md">
                  Diagnostic intelligent de tes talents réels, savoir-faire pratiques et aspirations d'avenir.
                </p>
              </div>
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0 group-hover:translate-x-1.5 transition-transform">
                →
              </div>
            </div>
          </Link>

          {/* COLONNE DE 3 CARTES */}
          <div className="flex flex-col gap-6">

            {/* CARTE 2 : CAP FORMATION (Voile jaune, texte marine) */}
            <Link
              href="/formations"
              className="group relative h-48 sm:h-52 rounded-[28px] overflow-hidden shadow-md flex flex-col justify-end transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Image
                src="/img/cafe.jpg"
                alt="Cap Formation"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="relative z-10 px-8 py-5 bg-gradient-to-t from-[#f5ad0f] via-[#FFB81C]/95 to-transparent text-[#0A2A5C] flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-extrabold mb-1">Cap Formation</h3>
                  <p className="text-xs sm:text-sm font-medium opacity-90 max-w-sm">
                    Formations certifiantes courtes et pratiques adaptées aux besoins du marché local.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#0A2A5C]/10 flex items-center justify-center text-lg shrink-0 group-hover:translate-x-1.5 transition-transform">
                  →
                </div>
              </div>
            </Link>

            {/* CARTE 3 : HORIZON EMPLOI (Voile marine, texte blanc) */}
            <Link
              href="/opportunites"
              className="group relative h-48 sm:h-52 rounded-[28px] overflow-hidden shadow-md flex flex-col justify-end transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Image
                src="/img/bureau.jpg"
                alt="Horizon Emploi"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="relative z-10 px-8 py-5 bg-gradient-to-t from-[#082148] via-[#0A2A5C]/90 to-transparent text-white flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-extrabold mb-1">Horizon Emploi</h3>
                  <p className="text-xs sm:text-sm opacity-90 max-w-sm">
                    Offres vérifiées, stages tremplins et missions auprès de nos entreprises partenaires.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg shrink-0 group-hover:translate-x-1.5 transition-transform">
                  →
                </div>
              </div>
            </Link>

            {/* CARTE 4 : ÉQUIPAGE (Voile blanc, texte marine) */}
            <Link
              href="/communaute"
              className="group relative h-48 sm:h-52 rounded-[28px] overflow-hidden shadow-md flex flex-col justify-end transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <Image
                src="/img/recruteur.jpg"
                alt="Équipage Communauté"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="relative z-10 px-8 py-5 bg-gradient-to-t from-white via-white/95 to-transparent text-[#0A2A5C] flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-extrabold mb-1">Équipage</h3>
                  <p className="text-xs sm:text-sm text-[#536B88] max-w-sm">
                    Communauté bienveillante, mentorat par des pairs et réseau de professionnels engagés.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#0A2A5C]/10 flex items-center justify-center text-lg shrink-0 group-hover:translate-x-1.5 transition-transform">
                  →
                </div>
              </div>
            </Link>

          </div>

        </div>
      </section>

      {/* TRANSITION VERS SECTION IA */}
      <div className="w-full overflow-hidden leading-none bg-white">
        <svg viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none" className="w-full h-12 block">
          <path d="M0,16 C320,48 640,0 960,32 C1200,48 1360,16 1440,24 L1440,48 L0,48 Z" fill="#FAFEFF" />
        </svg>
      </div>

      {/* 5. SECTION IA (PHAR IA) */}
      <section className="bg-[#FAFEFF] py-24 px-6 lg:px-12">
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className="inline-flex items-center gap-2 bg-[#22C3C9]/15 text-[#129aa0] px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest mb-6">
              Technologie Bienveillante
            </div>

            <h2 className="font-display text-3xl sm:text-4xl text-[#0A2A5C] leading-tight mb-6">
              PHAR IA : L'INTELLIGENCE QUI ÉCOUTE TON HISTOIRE
            </h2>

            <p className="text-base sm:text-lg text-[#536B88] mb-10 leading-relaxed">
              Pas de questionnaire froid. PHAR IA échange simplement avec toi pour comprendre ce que tu sais faire, même ce que l'école n'a jamais mesuré.
            </p>

            <div className="space-y-6">
              <div className="flex gap-5 items-start">
                <div className="w-11 h-11 rounded-xl bg-[#EFFAFB] text-[#22C3C9] border-2 border-[#22C3C9] flex items-center justify-center text-lg font-extrabold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0A2A5C] mb-1">Écoute et orientation humaine</h4>
                  <p className="text-sm text-[#536B88] leading-relaxed">
                    Dialogue naturel en français et adapté aux contextes locaux, par message écrit ou notes vocales sans formalisme intimidant.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 items-start">
                <div className="w-11 h-11 rounded-xl bg-[#EFFAFB] text-[#22C3C9] border-2 border-[#22C3C9] flex items-center justify-center text-lg font-extrabold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0A2A5C] mb-1">Repérage des compétences non scolaires</h4>
                  <p className="text-sm text-[#536B88] leading-relaxed">
                    Gestion d'un étal de marché, négociation, confection, organisation d'ateliers : chaque expérience vécue est traduite en compétences professionnelles reconnues.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 items-start">
                <div className="w-11 h-11 rounded-xl bg-[#EFFAFB] text-[#22C3C9] border-2 border-[#22C3C9] flex items-center justify-center text-lg font-extrabold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0A2A5C] mb-1">Recommandation personnalisée d'opportunités</h4>
                  <p className="text-sm text-[#536B88] leading-relaxed">
                    Connexion instantanée avec les formations et les recruteurs qui recherchent exactement tes forces et ton potentiel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-[480px] lg:h-[540px] rounded-[32px] overflow-hidden shadow-lg">
            <Image
              src="/img/mentor.jpg"
              alt="Orientation bienveillante"
              fill
              className="object-cover"
            />
          </div>

        </div>
      </section>

      {/* 6. APPEL À L'ACTION FINAL (CTA) */}
      <section className="max-w-[1320px] mx-auto px-6 lg:px-12 my-12">
        <div className="relative rounded-[32px] overflow-hidden shadow-xl">
          <div className="absolute inset-0 z-0">
            <Image src="/img/equipe.jpg" alt="Équipe" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#FFB81C]/90 to-[#22C3C9]/90" />
          
          <div className="relative z-20 px-8 py-20 text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#0A2A5C] leading-tight mb-8">
              « TON AVENIR NE DOIT PAS DÉPENDRE DES OPPORTUNITÉS QUE TU N'AS JAMAIS EUES. »
            </h2>
            <Link
              href="/connexion?mode=inscription"
              className="inline-flex items-center gap-3 bg-[#0A2A5C] text-white font-extrabold text-base sm:text-lg px-10 py-5 rounded-2xl shadow-[0_10px_30px_rgba(10,42,92,0.3)] hover:bg-[#0d3470] hover:-translate-y-0.5 transition-all"
            >
              Commencer mon parcours
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <Footer />
    </div>
  );
}
