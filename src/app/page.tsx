import Link from "next/link";
import { ButtonLink, Logo, VerifiedBadge } from "@/components/ui";
import { HeroDemo } from "@/components/HeroDemo";

const STEPS = [
  { t: "Racontez votre quotidien", d: "Cinq questions simples sur ce que vous faites déjà : aider en boutique, coudre, garder des enfants, animer une page." },
  { t: "Découvrez vos compétences", d: "L'IA transforme vos réponses en compétences claires et propose des activités qui peuvent vous rapporter." },
  { t: "Recevez des missions adaptées", d: "Les offres sont classées selon votre profil, avec la raison de chaque suggestion." },
  { t: "Postulez avec l'assistante", d: "Elle rédige avec vous votre candidature et vous prépare au rendez-vous." },
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/connexion" className="whitespace-nowrap rounded-full px-4 py-2.5 text-[15px] font-semibold text-plum hover:bg-plum-50">Se connecter</Link>
          <span className="hidden sm:block"><ButtonLink href="/connexion?mode=inscription" variant="primary">Créer mon profil</ButtonLink></span>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div>
          <h1 className="font-display text-[46px] text-plum sm:text-[64px] lg:text-[78px]">Vos compétences méritent d&apos;être vues.</h1>
          <p className="mt-6 max-w-[33rem] text-lg leading-relaxed text-muted sm:text-xl">
            NAYA aide les jeunes femmes de 18 à 30 ans à repérer ce qu&apos;elles savent faire, même appris hors de l&apos;école,
            et à trouver des missions rémunérées vérifiées.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/connexion?mode=inscription" variant="accent" className="px-7 py-4 text-base">Créer mon profil</ButtonLink>
            <ButtonLink href="/connexion?mode=inscription&role=recruteur" variant="secondary" className="px-7 py-4 text-base">Je propose une mission</ButtonLink>
          </div>
          <p className="mt-6 text-sm text-muted">Gratuit. Votre profil reste privé tant que vous ne postulez pas.</p>
        </div>
        <HeroDemo />
      </section>

      {/* PARCOURS */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display max-w-xl text-[34px] text-plum sm:text-[48px]">De votre quotidien à votre première mission</h2>
          <ol className="relative mt-14 grid gap-10 lg:grid-cols-4 lg:gap-8">
            <span aria-hidden className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-plum/15 lg:left-0 lg:top-[19px] lg:h-px lg:w-full" />
            {STEPS.map((s, i) => (
              <li key={s.t} className="relative pl-14 lg:pl-0 lg:pt-14">
                <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-plum text-[15px] font-bold text-white ring-8 ring-white">
                  {i + 1}
                </span>
                <h3 className="text-lg font-bold text-ink">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CONFIANCE */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-[34px] text-plum sm:text-[48px]">Des offres contrôlées, une décision qui reste la vôtre</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            Chaque mission est vérifiée par l&apos;équipe NAYA avant d&apos;être publiée. L&apos;IA vous conseille, mais elle ne promet pas
            d&apos;emploi et ne choisit jamais à votre place.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <VerifiedBadge />
            <span className="text-sm text-muted">Ce badge l&apos;indique sur chaque offre.</span>
          </div>
        </div>
        <ul className="space-y-3">
          {[
            ["Offre vérifiée avant publication", "Structure, rémunération et contact sont contrôlés."],
            ["Signalement en un geste", "Une offre vous paraît suspecte ? Signalez-la, elle est réexaminée."],
            ["Profil privé par défaut", "Un recruteur ne vous voit que si vous lui envoyez votre candidature."],
            ["Jamais de frais à payer", "Une vraie mission ne vous demande jamais d'argent. NAYA vous le rappelle."],
          ].map(([t, d]) => (
            <li key={t} className="flex gap-4 rounded-[22px] bg-white p-5 ring-1 ring-line">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-50 font-bold text-sage-700" aria-hidden>✓</span>
              <div>
                <p className="font-semibold text-ink">{t}</p>
                <p className="text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* STRUCTURES */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="grid gap-8 rounded-[32px] bg-plum px-6 py-12 text-white sm:px-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-[32px] sm:text-[44px]">Vous avez une mission à confier&nbsp;?</h2>
            <p className="mt-4 max-w-xl text-lg text-white/75">
              Entreprises, associations, particuliers : publiez une offre, elle est vérifiée puis proposée aux profils qui correspondent.
            </p>
          </div>
          <div className="flex lg:justify-end">
            <ButtonLink href="/connexion?mode=inscription&role=recruteur" variant="secondary" className="px-7 py-4 ring-0">Publier une mission</ButtonLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} NAYA. Révéler les compétences, ouvrir les opportunités.</p>
        </div>
      </footer>
    </main>
  );
}
