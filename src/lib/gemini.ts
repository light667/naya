// Client Google Gemini (côté serveur uniquement). Clé : GEMINI_API_KEY (ou GOOGLE_API_KEY).
import type { ChatMessage } from "./mistral";

const API = "https://generativelanguage.googleapis.com/v1beta/models";

export const GEMINI_MODELS = {
  text: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  fast: process.env.GEMINI_FAST_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash",
  vision: process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash",
};

const key = () => process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
export const hasGemini = () => !!key();

/** Levée quand Gemini refuse pour quota / débit (429) ou surcharge (503), même après une nouvelle tentative. */
export class GeminiRateLimitError extends Error {}

const COOLDOWN_MS = 60_000;
let pausedUntil = 0;
export const geminiAvailable = () => hasGemini() && Date.now() >= pausedUntil;

export type Tier = keyof typeof GEMINI_MODELS;
export type GeminiOpts = { tier?: Tier; temperature?: number; maxTokens?: number; json?: boolean; schema?: object };

type GPart = { text: string } | { inline_data: { mime_type: string; data: string } };

/** Image https (Supabase) ou data URL → données en ligne pour Gemini. */
async function imagePart(src: string): Promise<GPart> {
  const m = src.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (m) return { inline_data: { mime_type: m[1], data: m[2] } };
  const res = await fetch(src, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`Image inaccessible (${res.status})`);
  const type = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 6_000_000) throw new Error("Image trop lourde");
  return { inline_data: { mime_type: type, data: buf.toString("base64") } };
}

async function toBody(messages: ChatMessage[], o: GeminiOpts) {
  const system = messages.filter((m) => m.role === "system").map((m) => (typeof m.content === "string" ? m.content : "")).join("\n\n");
  const contents: { role: "user" | "model"; parts: GPart[] }[] = [];
  for (const m of messages.filter((x) => x.role !== "system")) {
    const parts: GPart[] = [];
    if (typeof m.content === "string") parts.push({ text: m.content });
    else for (const p of m.content) parts.push(p.type === "text" ? { text: p.text } : await imagePart(p.image_url));
    const role = m.role === "assistant" ? "model" : "user";
    // Gemini exige l'alternance des rôles : on fusionne deux messages consécutifs du même rôle.
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts.push(...parts);
    else contents.push({ role, parts });
  }
  if (contents[0]?.role === "model") contents.unshift({ role: "user", parts: [{ text: "Bonjour" }] });
  return {
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    contents,
    generationConfig: {
      temperature: o.temperature ?? 0.5,
      maxOutputTokens: o.maxTokens ?? 2048,
      // Pas de « réflexion » : réponses plus rapides, et le budget de sortie sert entièrement au texte.
      thinkingConfig: { thinkingBudget: 0 },
      ...(o.json || o.schema ? { responseMimeType: "application/json" } : {}),
      ...(o.schema ? { responseSchema: o.schema } : {}),
    },
  };
}

async function post(path: string, body: unknown, timeoutMs: number) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key() },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.ok) return res;
    const text = (await res.text()).slice(0, 300);
    if ((res.status === 429 || res.status === 503) && attempt === 0) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    if (res.status === 429 || res.status === 503) {
      pausedUntil = Date.now() + COOLDOWN_MS;
      throw new GeminiRateLimitError(`Gemini ${res.status}, pause ${COOLDOWN_MS / 1000} s : ${text}`);
    }
    throw new Error(`Gemini ${res.status}: ${text}`);
  }
}

const textOf = (data: { candidates?: { content?: { parts?: { text?: string }[] } }[] }) =>
  (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");

export async function geminiChat(messages: ChatMessage[], o: GeminiOpts = {}): Promise<string> {
  if (Date.now() < pausedUntil) throw new GeminiRateLimitError("Gemini en pause (quota dépassé récemment)");
  const model = GEMINI_MODELS[o.tier ?? "text"];
  const res = await post(`${model}:generateContent`, await toBody(messages, o), 50_000);
  return textOf(await res.json()).trim();
}

/** Réponse en flux (SSE) : renvoie les morceaux de texte au fur et à mesure. */
export async function* geminiStream(messages: ChatMessage[], o: GeminiOpts = {}): AsyncGenerator<string> {
  if (Date.now() < pausedUntil) throw new GeminiRateLimitError("Gemini en pause (quota dépassé récemment)");
  const model = GEMINI_MODELS[o.tier ?? "text"];
  const res = await post(`${model}:streamGenerateContent?alt=sse`, await toBody(messages, o), 50_000);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let i;
    while ((i = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, i).trim();
      buffer = buffer.slice(i + 1);
      if (!line.startsWith("data:")) continue;
      try {
        const chunk = textOf(JSON.parse(line.slice(5)));
        if (chunk) yield chunk;
      } catch {
        /* ligne incomplète : ignorée */
      }
    }
  }
}
