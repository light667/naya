import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz", "wdth"] });

export const metadata: Metadata = {
  title: "NAYA — Vos compétences, vos opportunités",
  description:
    "La plateforme qui aide les jeunes femmes à révéler leurs compétences et à trouver des missions rémunérées vérifiées.",
};

export const viewport: Viewport = { themeColor: "#FAFAFA", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${bricolage.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
