import Link from "next/link";
import { Logo } from "@/components/ui";

const LINKS = [
  { label: "Offres", href: "/opportunites" },
  { label: "Formations", href: "/formations" },
  { label: "Assistant", href: "/assistant-ia" },
  { label: "Réseau", href: "/communaute" },
  { label: "Espace recruteur", href: "/connexion?mode=inscription&role=entreprise" },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <Logo />
            <p className="text-sm text-muted">Aucun frais n&apos;est jamais demandé aux candidats.</p>
          </div>
          <nav aria-label="Pied de page" className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="flex min-h-11 items-center text-sm text-muted transition-colors hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 border-t border-line pt-6 text-xs text-muted">© {new Date().getFullYear()} PHAR / NAYA</p>
      </div>
    </footer>
  );
}
