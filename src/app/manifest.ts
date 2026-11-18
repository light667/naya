import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PHAR — Ton avenir a un cap. PHAR l'éclaire.",
    short_name: "PHAR",
    description: SITE_DESCRIPTION,
    lang: "fr",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#F8FCFD",
    theme_color: "#0A2A5C",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/img/logo_phar_trimmed.png", sizes: "342x266", type: "image/png", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
