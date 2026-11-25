import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s · PHAR" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "PHAR", "inclusion des jeunes", "employabilité Afrique", "compétences informelles",
    "couture", "artisanat", "commerce", "mentorat", "stages", "opportunités vérifiées",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  category: "emploi",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/img/logo_phar_trimmed.png", type: "image/png" },
    ],
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8EF",
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="bg-bg">
      <body className="font-sans antialiased bg-bg text-ink pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
        <div className="wax-band" aria-hidden />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
