import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    `Variable(s) d'environnement manquante(s) : ${[!url && "NEXT_PUBLIC_SUPABASE_URL", !key && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"].filter(Boolean).join(", ")}. ` +
      "En local : .env.local. Sur Vercel : Project > Settings > Environment Variables, puis redéployer.",
  );
}

export const supabase = createClient(url, key);
