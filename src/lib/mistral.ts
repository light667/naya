// Client Mistral (côté serveur uniquement). Clé : MISTRAL_API_KEY dans .env.local.

const API = "https://api.mistral.ai/v1";

export const MODELS = {
  text: process.env.MISTRAL_MODEL || "mistral-large-latest",
  fast: process.env.MISTRAL_FAST_MODEL || "mistral-small-latest",
  vision: process.env.MISTRAL_VISION_MODEL || "mistral-medium-latest",
  transcription: process.env.MISTRAL_TRANSCRIPTION_MODEL || "voxtral-mini-latest",
};

/** Modèle de repli quand l'abonnement refuse un modèle (mistral-small gère aussi les images). */
const FALLBACK_MODEL = process.env.MISTRAL_FALLBACK_MODEL || "mistral-small-latest";

/** Modèles refusés par l'abonnement (403 tier_not_allowed), mémorisés tant que l'instance vit. */
const refused = new Set<string>();

export const hasMistral = () => !!process.env.MISTRAL_API_KEY;

type Part = { type: "text"; text: string } | { type: "image_url"; image_url: string };
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string | Part[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function chat(
  messages: ChatMessage[],
  opts: { model?: string; json?: boolean; temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  let model = opts.model ?? MODELS.text;
  if (refused.has(model)) model = FALLBACK_MODEL;

  // Jusqu'à 2 attentes sur 429 (offre gratuite : débit très limité) et 1 bascule de modèle sur 403.
  for (let attempt = 0, waits = 0; ; attempt++) {
    const res = await fetch(`${API}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.maxTokens ?? 2500,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(50_000),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      const text = Array.isArray(content) ? content.map((c: { text?: string }) => c.text ?? "").join("") : String(content ?? "");
      return text.trim();
    }

    const body = (await res.text()).slice(0, 300);
    if (res.status === 403 && /tier_not_allowed|subscription tier/.test(body) && model !== FALLBACK_MODEL) {
      console.warn(`[mistral] modèle « ${model} » non inclus dans l'abonnement → ${FALLBACK_MODEL}`);
      refused.add(model);
      model = FALLBACK_MODEL;
      continue;
    }
    if (res.status === 429 && waits < 2) {
      const retryAfter = Number(res.headers.get("retry-after"));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 5000) : 1500 * (waits + 1));
      waits++;
      continue;
    }
    throw new Error(`Mistral ${res.status} (${model}, essai ${attempt + 1}): ${body}`);
  }
}

/** Appel qui doit renvoyer un objet JSON ; tolère un éventuel bloc ```json. */
export async function chatJson<T>(messages: ChatMessage[], opts: Parameters<typeof chat>[1] = {}): Promise<T> {
  const raw = await chat(messages, { ...opts, json: true });
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned) as T;
}

export async function transcribe(file: Blob, filename: string, language = "fr"): Promise<string> {
  const form = new FormData();
  form.append("model", MODELS.transcription);
  form.append("file", file, filename);
  form.append("language", language);
  const res = await fetch(`${API}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`Transcription ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return String(data.text ?? "").trim();
}
