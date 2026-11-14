import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion ou inscription",
  description: "Créez votre profil NAYA gratuitement ou connectez-vous pour retrouver vos missions, votre portfolio et votre assistante.",
  alternates: { canonical: "/connexion" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
