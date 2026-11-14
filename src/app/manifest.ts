import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NAYA — Vos compétences, vos opportunités",
    short_name: "NAYA",
    description: SITE_DESCRIPTION,
    lang: "fr",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#F6F4FD",
    theme_color: "#150B3F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
