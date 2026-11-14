// Adresse publique du site (liens absolus, partage, sitemap).
// Sur Vercel, définissez NEXT_PUBLIC_SITE_URL=https://votre-domaine ; sinon l'adresse Vercel de production est utilisée.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "NAYA";
export const SITE_TITLE = "NAYA — Vos compétences méritent d'être vues";
export const SITE_DESCRIPTION =
  "NAYA aide les jeunes femmes de 18 à 30 ans au Togo et en Afrique de l'Ouest à révéler leurs compétences, même apprises hors de l'école, à créer leur portfolio et à trouver des missions rémunérées vérifiées.";
