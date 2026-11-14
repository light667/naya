import Link from "next/link";
import { ButtonLink, Logo } from "@/components/ui";
import { HeroDemo } from "@/components/HeroDemo";
import { Photo } from "@/components/Photo";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Données structurées pour Google : organisation + site web
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}/#org`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon-512.png`, description: SITE_DESCRIPTION, areaServed: "TG" },
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, url: SITE_URL, name: SITE_NAME, inLanguage: "fr", publisher: { "@id": `${SITE_URL}/#org` } },
  ],
};

const RIBBON = ["Réseaux sociaux", "Cuisine", "Garde d'enfants", "Artisanat", "Coiffure", "Vente en ligne", "Couture", "Soutien scolaire", "Organisation d'événements"];

const TILES = [
  { t: "Vendre", d: "Boutique, pagnes, vente en ligne", src: "/images/vendre.jpg", alt: "Jeune femme rangeant des pagnes wax dans sa boutique", cls: "col-span-2", pos: "object-[50%_40%]" },
  { t: "Cuisiner", d: "Transformation, traiteur", src: "/images/cuisiner.jpg", alt: "Femme présentant une bassine de farine au marché", cls: "row-span-2", pos: "object-top" },
  { t: "Créer", d: "Artisanat, objets d'art", src: "/images/artisanat.jpg", alt: "Artisane devant ses sculptures sur un stand", cls: "row-span-2", pos: "object-top" },
  { t: "Commercer", d: "Marché, relation client", src: "/images/marche.jpg", alt: "Commerçante montrant ses ignames au marché", cls: "col-span-2", pos: "object-[50%_35%]" },
];

const JOURNEYS = [
  { label: "Service et accueil", src: "/images/parcours-service.jpg", alt: "Jeune serveuse souriante devant un café", skills: ["Sens du contact", "Travail en équipe", "Rapidité"], mission: "Serveuse en café partenaire" },
  { label: "Organisation", src: "/images/parcours-organisation.jpg", alt: "Jeune femme travaillant sur son ordinateur dans un café", skills: ["Saisie", "Organisation", "Communication"], mission: "Assistante administrative" },
  { label: "Côté recruteur", src: "", alt: "", skills: ["Offre vérifiée", "Profils classés", "Contact sûr"], mission: "Vous publiez, NAYA vérifie" },
];

const STEPS = [
  { t: "Racontez votre quotidien", d: "Cinq questions simples, à l'écrit ou à voix haute : aider en boutique, coudre, garder des enfants, animer une page." },
  { t: "Découvrez vos compétences", d: "L'IA transforme vos réponses en compétences claires et construit avec vous un portfolio à partager." },
  { t: "Recevez des missions adaptées", d: "Chaque offre affiche votre score de compatibilité, calculé et expliqué critère par critère." },
  { t: "Postulez avec l'assistante", d: "Elle rédige une candidature liée à la mission, sans rien inventer, et vous prépare au rendez-vous." },
];

const TRUST = [
  ["Offre vérifiée avant publication", "Structure, rémunération et contact sont contrôlés."],
  ["Signalement en un geste", "Une offre vous paraît suspecte ? Signalez-la, elle est réexaminée."],
  ["Profil privé par défaut", "Un recruteur ne vous voit que si vous lui envoyez votre candidature."],
  ["Jamais de frais à payer", "Une vraie mission ne vous demande jamais d'argent."],
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      {/* HERO */}
      <section className="bg-dots relative bg-night text-white">
        <div aria-hidden className="pointer-events-none absolute right-0 top-16 h-[420px] w-[420px] max-w-full rounded-full glow-sun" />
        <div aria-hidden className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full glow-coral" />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <span className="rounded-2xl bg-white px-3 py-1.5"><Logo /></span>
          <nav className="flex items-center gap-2">
            <Link href="/connexion" className="whitespace-nowrap rounded-full px-4 py-2.5 text-[15px] font-semibold text-white ring-1 ring-inset ring-white/30 hover:bg-white/10">Se connecter</Link>
            <span className="hidden sm:block"><ButtonLink href="/connexion?mode=inscription" variant="accent">Créer mon profil</ButtonLink></span>
          </nav>
        </header>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-8 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-32 lg:pt-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium ring-1 ring-white/20">✦ Pour les jeunes femmes de 18 à 30 ans</span>
            <h1 className="font-display mt-6 text-[48px] sm:text-[68px] lg:text-[80px]">
              Vos compétences méritent <span className="text-glow">d&apos;être vues.</span>
            </h1>
            <p className="mt-6 max-w-[33rem] text-lg leading-relaxed text-white/75 sm:text-xl">
              NAYA repère ce que vous savez faire, même appris hors de l&apos;école, et vous ouvre des missions rémunérées vérifiées.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/connexion?mode=inscription" variant="accent" className="px-7 py-4 text-base">Créer mon profil</ButtonLink>
              <Link href="/connexion?mode=inscription&role=recruteur" className="inline-flex items-center justify-center rounded-full px-7 py-4 text-base font-semibold text-white ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/10">Je propose une mission</Link>
            </div>
            <p className="mt-6 text-sm text-white/55">Gratuit · Profil privé tant que vous ne postulez pas</p>
          </div>

          <div className="relative mx-auto w-full max-w-[460px]">
            <Photo src="/images/hero.jpg" alt="Jeune créatrice souriante derrière son stand de savons artisanaux" priority tone={1} imgClassName="object-[50%_30%]" className="aspect-[4/5] w-[74%] rounded-t-[999px] rounded-b-[36px] ring-1 ring-white/15" />
            <div className="absolute -bottom-12 right-0 w-[70%]"><HeroDemo /></div>
          </div>
        </div>
      </section>

      {/* RUBAN */}
      <div className="relative z-10 -mt-6 -rotate-2 bg-sun py-3.5 shadow-[0_18px_40px_-20px_rgba(242,154,0,0.8)]" aria-hidden>
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap font-display text-[20px] text-night">
          {[...RIBBON, ...RIBBON].map((r, i) => <span key={i} className="flex items-center gap-8">{r}<span className="text-night/50">✦</span></span>)}
        </div>
      </div>

      {/* CE QUE VOUS FAITES DÉJÀ */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <h2 className="font-display max-w-xl text-[36px] text-plum sm:text-[52px]">Ce que vous faites déjà <span className="text-glow">a de la valeur</span></h2>
        <ul className="mt-12 grid auto-rows-[170px] grid-cols-2 gap-3 sm:auto-rows-[240px] sm:grid-cols-4 sm:gap-4">
          {TILES.map((t, i) => (
            <li key={t.t} className={`group relative overflow-hidden rounded-[26px] ${t.cls}`}>
              <Photo src={t.src} alt={t.alt} tone={i} imgClassName={t.pos} className="absolute inset-0 transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent" />
              <span className="absolute bottom-4 left-4 right-4 text-white">
                <span className="font-display block text-[24px]">{t.t}</span>
                <span className="text-sm text-white/80">{t.d}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* EXEMPLES DE PARCOURS */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-coral-600">Exemples de parcours</p>
        <h2 className="font-display mt-2 max-w-xl text-[34px] text-plum sm:text-[46px]">Du geste du quotidien à la compétence qui se voit</h2>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {JOURNEYS.map((j, i) => (
            <li key={j.label} className="overflow-hidden rounded-[28px] bg-white shadow-[0_24px_50px_-30px_rgba(42,27,110,0.45)] ring-1 ring-line">
              <div className="relative h-56">
                <Photo src={j.src} alt={j.alt} tone={i + 1} imgClassName="object-[50%_25%]" className="absolute inset-0" />
                <span className="absolute inset-0 bg-gradient-to-t from-night/75 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-night/70 px-2.5 py-1 text-[12px] font-semibold text-white">Exemple</span>
                <span className="font-display absolute bottom-4 left-4 text-[24px] text-white">{j.label}</span>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">{j.skills.map((s) => <span key={s} className="rounded-full bg-plum-50 px-3 py-1 text-[13px] font-medium text-plum">{s}</span>)}</div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
                  <span className="text-muted">Mission possible</span>
                  <span className="text-right font-semibold text-ink">{j.mission}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ÉTAPES */}
      <section className="bg-dots relative overflow-hidden bg-night py-20 text-white sm:py-28">
        <div aria-hidden className="pointer-events-none absolute -left-32 bottom-0 h-[460px] w-[460px] rounded-full glow-blue" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display max-w-xl text-[36px] sm:text-[52px]">De votre quotidien à votre première mission</h2>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="rounded-[26px] bg-white/[0.06] p-6 ring-1 ring-white/15 backdrop-blur-sm">
                <span className="font-display text-glow text-[44px] leading-none">{i + 1}</span>
                <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/70">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CONFIANCE */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative">
          <Photo src="/images/confiance.jpg" alt="Deux jeunes femmes travaillant sur leurs ordinateurs" tone={2} className="aspect-[4/5] rounded-[32px] shadow-[0_40px_80px_-40px_rgba(42,27,110,0.6)]" />
          <span className="absolute -bottom-4 right-6 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-sage-700 shadow-lg ring-1 ring-line">✓ Vérifiée par NAYA</span>
        </div>
        <div>
          <h2 className="font-display text-[34px] text-plum sm:text-[48px]">Des offres contrôlées, une décision qui reste la vôtre</h2>
          <ul className="mt-8 space-y-3">
            {TRUST.map(([t, d]) => (
              <li key={t} className="flex gap-4 rounded-[22px] bg-white p-5 ring-1 ring-line">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-50 font-bold text-sage-700" aria-hidden>✓</span>
                <div>
                  <p className="font-semibold text-ink">{t}</p>
                  <p className="text-muted">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MISSION À CONFIER */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="relative overflow-hidden rounded-[34px] px-6 py-14 text-white sm:px-12">
          <span className="absolute inset-0 bg-gradient-to-br from-[#2a1b6e] via-[#8a3a8f] to-[#ffb21e]" />
          <span className="absolute inset-0 bg-gradient-to-r from-[#b7853d]/90 via-[#c0607a]/80 to-[#d0508e]/70" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-[34px] sm:text-[46px]">Vous avez une mission à confier&nbsp;?</h2>
              <p className="mt-4 max-w-xl text-lg text-white/85">Entreprises, associations, particuliers : publiez une offre, elle est vérifiée puis proposée aux profils qui correspondent.</p>
            </div>
            <div className="flex lg:justify-end">
              <ButtonLink href="/connexion?mode=inscription&role=recruteur" variant="accent" className="px-7 py-4">Publier une mission</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-night text-white/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm sm:px-6">
          <span className="rounded-2xl bg-white px-3 py-1.5"><Logo /></span>
          <p>© {new Date().getFullYear()} NAYA. Révéler les compétences, ouvrir les opportunités.</p>
        </div>
      </footer>
    </main>
  );
}
