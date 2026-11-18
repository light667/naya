// Adresse publique du site (liens absolus, partage, sitemap).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "PHAR";
export const SITE_TITLE = "PHAR — Ton avenir a un cap. PHAR l'éclaire.";
export const SITE_DESCRIPTION =
  "PHAR éclaire le potentiel des talents africains, valorise chaque parcours, même appris hors de l'école, et connecte les jeunes de 18 à 30 ans aux opportunités d'avenir.";
