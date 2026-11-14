import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { PublicPortfolio } from "./PublicPortfolio";
import type { PortfolioData } from "@/components/portfolio/PortfolioView";

export const dynamic = "force-dynamic";

async function load(slug: string): Promise<PortfolioData | null> {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
  const { data, error } = await sb.rpc("get_portfolio", { p_slug: slug });
  if (error || !data) return null;
  return data as PortfolioData;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await load(slug);
  if (!d) return { title: "Portfolio", robots: { index: false, follow: false } };
  const title = `${d.profile.full_name}${d.profile.headline ? ` — ${d.profile.headline}` : ""}`;
  const description = (d.profile.settings?.intro || d.profile.bio || "Portfolio professionnel sur NAYA").slice(0, 160);
  const images = d.profile.avatar_url ? [d.profile.avatar_url] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/p/${slug}` },
    openGraph: { type: "profile", url: `/p/${slug}`, title, description, images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Lecture anonyme : ne renvoie le portfolio que si le partage public est activé.
  // Sinon, le composant client réessaie avec la session (aperçu par la propriétaire).
  return <PublicPortfolio slug={slug} initial={await load(slug)} />;
}
