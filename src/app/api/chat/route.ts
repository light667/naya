import { createClient } from "@supabase/supabase-js";
import { aiAvailable, chatStream } from "@/lib/llm";
import { localChatResponse } from "@/lib/phar-local";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Prompt système de l'assistant PHAR. */
function systemPrompt(p: { firstName: string; trade: string; city: string; skills: string[] }) {
  const known = [
    p.firstName && `Prénom : ${p.firstName}`,
    p.trade && `Métier : ${p.trade}`,
    p.city && `Ville : ${p.city}`,
    p.skills.length && `Compétences déjà connues : ${p.skills.join(", ")}`,
  ].filter(Boolean);
  return [
    "Tu es l'assistant PHAR, une plateforme qui aide les jeunes de 18 à 30 ans de Lomé et d'Afrique de l'Ouest (artisans, couturières, commerçants, cuisiniers, jeunes du numérique) à montrer ce qu'ils savent faire et à trouver du travail.",
    "Façon de parler :",
    "- Tu tutoies. Français simple, phrases courtes, pas de jargon.",
    "- 4 phrases au maximum, sauf si la personne demande plus de détails.",
    "- Une seule question à la fois, puis tu attends la réponse.",
    "- Exemples locaux : prix en FCFA, marché d'Adawlato, atelier de couture, WhatsApp, Lomé.",
    "- Pas de mise en forme : pas d'astérisques, pas de #, pas de listes longues. Des tirets simples si besoin.",
    "Règles :",
    "- Tu ne promets jamais un emploi, un revenu ni une certification officielle. Tu rappelles si besoin que tu ne remplaces pas un recruteur.",
    "- Tu ne demandes jamais de mot de passe, de pièce d'identité, de numéro de compte ni d'argent. Si quelqu'un parle de payer pour un emploi, tu préviens que c'est une arnaque.",
    "- Tu n'inventes rien sur la personne : tu t'appuies seulement sur ce qu'elle dit et sur ce qui est connu ci-dessous.",
    "- Tu ne reposes pas une question dont la réponse est déjà connue.",
    known.length ? `Ce que l'on sait déjà :\n${known.join("\n")}` : "On ne sait encore rien de la personne : commence par lui demander son métier ou ce qu'elle fait chaque jour.",
  ].join("\n");
}

const clean = (t: string) => t.replace(/\*\*(.*?)\*\*/g, "$1").replace(/(^|\s)\*(\S.*?)\*/g, "$1$2").replace(/^#{1,6}\s?/gm, "");

/**
 * Réponse en flux texte. En-tête `X-PHAR-Source` : `ia` (Gemini ou Mistral) ou `local` (moteur de secours).
 * Si l'IA échoue avant d'avoir écrit, on répond avec le moteur local et on le signale.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const message = String(body.message ?? "").slice(0, 3000).trim();
  if (!message) return Response.json({ error: "Message vide" }, { status: 400 });

  // Contexte du profil (facultatif : l'assistant marche aussi sans compte)
  let profile: Profile | null = null;
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (token) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: auth } = await sb.auth.getUser(token);
    if (auth.user) profile = ((await sb.from("profiles").select("*").eq("id", auth.user.id).maybeSingle()).data as Profile) ?? null;
  }
  const ctx = {
    firstName: (profile?.full_name || String(body.userName ?? "")).trim().split(/\s+/)[0] || "",
    trade: profile?.headline || "",
    city: profile?.city || "",
    skills: (profile?.skills ?? []).map((s) => s.name).slice(0, 15),
  };

  const history = (Array.isArray(body.history) ? body.history : [])
    .slice(-10)
    .map((h: { role?: string; content?: string }) => ({ role: h.role === "assistant" ? ("assistant" as const) : ("user" as const), content: String(h.content ?? "").slice(0, 2000) }))
    .filter((h: { content: string }) => h.content);

  const local = () =>
    new Response(localChatResponse(message, { userName: ctx.firstName, skills: ctx.skills }).reply, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-PHAR-Source": "local", "Cache-Control": "no-store" },
    });

  if (!aiAvailable()) return local();

  const gen = chatStream([{ role: "system", content: systemPrompt(ctx) }, ...history, { role: "user", content: message }], { temperature: 0.6, maxTokens: 700 });

  // On attend le premier morceau : si l'IA échoue tout de suite, on bascule proprement sur le moteur local.
  let first: IteratorResult<string>;
  try {
    first = await gen.next();
  } catch (e) {
    console.warn("[phar-ai] chat → moteur local :", (e as Error).message);
    return local();
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done) controller.enqueue(encoder.encode(clean(first.value)));
        for (;;) {
          const { value, done } = await gen.next();
          if (done) break;
          controller.enqueue(encoder.encode(clean(value)));
        }
        controller.close();
      } catch (e) {
        console.error("[phar-ai] chat coupé en cours de réponse :", e);
        controller.error(e);
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-PHAR-Source": "ia", "Cache-Control": "no-store" } });
}
