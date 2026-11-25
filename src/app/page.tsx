import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/icons";
import { SkillCard } from "@/components/SkillCard";

const PILLARS = [
  { href: "/assistant-ia", icon: Icon.chat, title: "Assistant", text: "Fais ressortir ce que tu sais faire, prépare un entretien, calcule ton prix" },
  { href: "/opportunites", icon: Icon.briefcase, title: "Offres", text: "Stages, apprentissages et missions, contrôlés avant d'être publiés" },
  { href: "/formations", icon: Icon.book, title: "Formations", text: "Des formations courtes en atelier : wax, cuir, caisse, WhatsApp Business" },
  { href: "/communaute", icon: Icon.people, title: "Réseau", text: "Pose tes questions et partage tes astuces d'atelier" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Une seule chose à regarder : le titre, une phrase, un bouton */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:min-h-[calc(100svh-70px)] md:grid-cols-[1.15fr_1fr] md:py-16">
        <div>
          <h1 className="text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[56px] lg:text-[64px]">
            Ce que tu sais faire a de la valeur
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            Raconte ton métier en quelques minutes. PHAR en fait une carte de compétences à montrer aux employeurs.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/assistant-ia"
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-sun px-6 text-base font-semibold text-white transition-colors hover:bg-sun-700 active:scale-[0.98]"
            >
              Créer ma carte de compétences
            </Link>
            <Link href="/opportunites" className="inline-flex min-h-12 items-center justify-center px-2 text-sm font-medium text-muted transition-colors hover:text-ink">
              Voir les offres
            </Link>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <SkillCard
            example
            firstName="Ama"
            trade="Couturière"
            city="Lomé"
            years={6}
            photo="/img/hero.jpg"
            skills={["Coupe wax", "Patron sur mesure", "Finitions", "Relation client", "Suivi des commandes"]}
          />
        </div>
      </section>

      {/* Le reste, deux fois plus discret */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold text-ink">Ce que tu trouves sur PHAR</h2>
          <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
            {PILLARS.map((p) => {
              const I = p.icon;
              return (
                <li key={p.href} className="border-t border-line first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
                  <Link href={p.href} className="group flex gap-4 py-5">
                    <span className="mt-0.5 text-muted">
                      <I />
                    </span>
                    <span>
                      <span className="block text-base font-semibold text-ink group-hover:text-sun">{p.title}</span>
                      <span className="mt-1 block text-sm text-muted">{p.text}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Prêt à commencer</h2>
            <p className="mt-2 text-sm text-muted">C&apos;est gratuit pour les candidats</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/connexion?mode=inscription"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Créer mon compte
            </Link>
            <Link
              href="/connexion?mode=inscription&role=entreprise"
              className="inline-flex min-h-12 items-center justify-center px-2 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Tu recrutes ? Espace recruteur
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
