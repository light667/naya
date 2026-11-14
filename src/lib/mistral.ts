// Client Mistral (côté serveur uniquement). Clé : MISTRAL_API_KEY dans .env.local.

const API = "https://api.mistral.ai/v1";

export const MODELS = {
  text: process.env.MISTRAL_MODEL || "mistral-large-latest",
  fast: process.env.MISTRAL_FAST_MODEL || "mistral-small-latest",
  vision: process.env.MISTRAL_VISION_MODEL || "mistral-medium-latest",
  transcription: process.env.MISTRAL_TRANSCRIPTION_MODEL || "voxtral-mini-latest",
};

export const hasMistral = () => !!process.env.MISTRAL_API_KEY;

type Part = { type: "text"; text: string } | { type: "image_url"; image_url: string };
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string | Part[] };

export async function chat(
  messages: ChatMessage[],
  opts: { model?: string; json?: boolean; temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const res = await fetch(`${API}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` },
    body: JSON.stringify({
      model: opts.model ?? MODELS.text,
      messages,
      temperature: opts.temperature ?? 0.5,
      max_tokens: opts.maxTokens ?? 2500,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`Mistral ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  const text = Array.isArray(content) ? content.map((c: { text?: string }) => c.text ?? "").join("") : String(content ?? "");
  return text.trim();
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
