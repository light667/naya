import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { chat, hasMistral, MODELS, transcribe } from "@/lib/mistral";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Saisie vocale : audio enregistré dans le navigateur → texte ponctué (Mistral Voxtral). */
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return NextResponse.json({ error: "Non connectée" }, { status: 401 });
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  const { data: auth } = await sb.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ error: "Session invalide" }, { status: 401 });
  if (!hasMistral()) return NextResponse.json({ error: "no_key" }, { status: 503 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob) || file.size === 0) return NextResponse.json({ error: "Aucun son reçu." }, { status: 400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "Enregistrement trop long (20 Mo max)." }, { status: 413 });
  const lang = form.get("lang") === "en" ? "en" : "fr";

  try {
    const ext = file.type.includes("mp4") ? "m4a" : file.type.includes("ogg") ? "ogg" : "webm";
    const raw = await transcribe(file, `dictee.${ext}`, lang);
    if (!raw) return NextResponse.json({ text: "" });
    // Mise en forme : ponctuation, majuscules, paragraphes, sans changer le sens.
    const text = await chat(
      [
        { role: "system", content: "Tu mets en forme des transcriptions vocales. Tu ne changes pas le sens et tu n'ajoutes aucune information." },
        { role: "user", content: `Corrige la ponctuation, les majuscules et découpe en paragraphes si nécessaire. Réponds uniquement avec le texte.\n\n"""${raw}"""` },
      ],
      { model: MODELS.fast, temperature: 0 },
    ).catch(() => raw);
    return NextResponse.json({ text: text.replace(/^"+|"+$/g, "").trim() });
  } catch (e) {
    console.error("[phar-transcribe]", e);
    return NextResponse.json({ error: "La transcription a échoué. Réessayez ou tapez votre texte." }, { status: 502 });
  }
}

/** Indique au navigateur si la transcription serveur est disponible (sinon : reconnaissance vocale du navigateur). */
export async function GET() {
  return NextResponse.json({ enabled: hasMistral() });
}
