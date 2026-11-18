import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion ou inscription",
  description: "Créez votre profil PHAR gratuitement ou connectez-vous pour retrouver vos opportunités, vos formations et votre espace personnel.",
  alternates: { canonical: "/connexion" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
