// Routeur IA Multi-Paliers PHAR : Mistral → Google Gemini (Gratuit) → Modèles Open-Source / Local
// Ce module orchestre les appels IA avec bascule automatique et coupe-circuit intelligent.

const MISTRAL_API = "https://api.mistral.ai/v1";
const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";

export const MODELS = {
  text: process.env.MISTRAL_MODEL || "mistral-small-latest",
  fast: process.env.MISTRAL_FAST_MODEL || "mistral-small-latest",
  vision: process.env.MISTRAL_VISION_MODEL || "mistral-medium-latest",
  transcription: process.env.MISTRAL_TRANSCRIPTION_MODEL || "voxtral-mini-latest",
};

export const GEMINI_MODELS = {
  primary: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  fallback: "gemini-1.5-flash",
};

export const OPENSOURCE_MODELS = {
  model: process.env.OPENSOURCE_MODEL || "meta-llama/Llama-3.2-3B-Instruct",
  url: process.env.OPENSOURCE_API_URL || (process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1" : "https://api-inference.huggingface.co/v1"),
};

export const hasMistral = () => !!process.env.MISTRAL_API_KEY;
export const hasGemini = () => !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
export const hasOpenSource = () => !!(process.env.OPENSOURCE_API_KEY || process.env.OPENROUTER_API_KEY || process.env.HUGGINGFACE_API_KEY || process.env.GROQ_API_KEY);

export class MistralRateLimitError extends Error {}

// Gestion du cooldown pour éviter les boucles d'erreurs
const COOLDOWN_MS = 60_000;
let mistralPausedUntil = 0;
let geminiPausedUntil = 0;
let openSourcePausedUntil = 0;

/** L'IA distante est disponible si au moins l'un des fournisseurs externes est configuré et non en pause */
export const aiAvailable = () => {
  const now = Date.now();
  if (hasMistral() && now >= mistralPausedUntil) return true;
  if (hasGemini() && now >= geminiPausedUntil) return true;
  if (hasOpenSource() && now >= openSourcePausedUntil) return true;
  return false;
};

type Part = { type: "text"; text: string } | { type: "image_url"; image_url: string };
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string | Part[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* =========================================================================
   PALIER 1 : MISTRAL AI
   ========================================================================= */
async function callMistral(
  messages: ChatMessage[],
  opts: { model?: string; json?: boolean; temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("Clé MISTRAL_API_KEY absente");
  if (Date.now() < mistralPausedUntil) throw new MistralRateLimitError("Mistral temporairement en pause suite à quota dépassé");

  const model = opts.model ?? MODELS.text;
  for (let attempt = 0, waits = 0; ; attempt++) {
    const res = await fetch(`${MISTRAL_API}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.maxTokens ?? 2500,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(35_000),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      const text = Array.isArray(content)
        ? content.map((c: { text?: string }) => c.text ?? "").join("")
        : String(content ?? "");
      return text.trim();
    }

    const body = (await res.text()).slice(0, 300);
    if (res.status === 429) {
      if (waits < 1) {
        const retryAfter = Number(res.headers.get("retry-after"));
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 3000) : 1500);
        waits++;
        continue;
      }
      mistralPausedUntil = Date.now() + COOLDOWN_MS;
      throw new MistralRateLimitError(`Mistral 429 quota dépassé : ${body}`);
    }
    throw new Error(`Mistral HTTP ${res.status}: ${body}`);
  }
}

/* =========================================================================
   PALIER 2 : GOOGLE GEMINI (Plan Gratuit : gemini-2.0-flash / gemini-1.5-flash)
   ========================================================================= */
async function callGemini(
  messages: ChatMessage[],
  opts: { json?: boolean; temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Clé GEMINI_API_KEY absente");
  if (Date.now() < geminiPausedUntil) throw new Error("Gemini temporairement en pause suite à quota");

  // Extraction des instructions système
  const systemMsgs = messages.filter((m) => m.role === "system");
  const systemInstruction = systemMsgs.length
    ? {
        parts: [
          {
            text: systemMsgs
              .map((m) => (typeof m.content === "string" ? m.content : JSON.stringify(m.content)))
              .join("\n\n"),
          },
        ],
      }
    : undefined;

  // Conversion des messages en format Gemini (user / model)
  const nonSystem = messages.filter((m) => m.role !== "system");
  const contents = nonSystem.map((m) => {
    const role = m.role === "assistant" ? "model" : "user";
    if (typeof m.content === "string") {
      return { role, parts: [{ text: m.content }] };
    }
    const parts = m.content.map((p) => {
      if (p.type === "text") return { text: p.text };
      const match = p.image_url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return { inline_data: { mime_type: match[1], data: match[2] } };
      }
      return { text: p.image_url };
    });
    return { role, parts };
  });

  const modelsToTry = [GEMINI_MODELS.primary, GEMINI_MODELS.fallback];

  for (const model of modelsToTry) {
    try {
      const url = `${GEMINI_API}/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(systemInstruction ? { system_instruction: systemInstruction } : {}),
          contents,
          generationConfig: {
            temperature: opts.temperature ?? 0.5,
            maxOutputTokens: opts.maxTokens ?? 2500,
            ...(opts.json ? { responseMimeType: "application/json" } : {}),
          },
        }),
        signal: AbortSignal.timeout(35_000),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }

      if (res.status === 429) {
        geminiPausedUntil = Date.now() + COOLDOWN_MS;
      }
    } catch (err) {
      console.warn(`[gemini] tentative ${model} échouée:`, err instanceof Error ? err.message : err);
    }
  }

  throw new Error("Toutes les requêtes Gemini ont échoué.");
}

/* =========================================================================
   PALIER 3 : MODÈLES OPEN-SOURCE (HuggingFace / OpenRouter / Groq / Ollama)
   ========================================================================= */
async function callOpenSource(
  messages: ChatMessage[],
  opts: { json?: boolean; temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const apiKey =
    process.env.OPENSOURCE_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    process.env.HUGGINGFACE_API_KEY ||
    process.env.GROQ_API_KEY;

  if (Date.now() < openSourcePausedUntil) throw new Error("OpenSource en pause");

  // URL de l'API OpenAI-compatible
  let endpoint = OPENSOURCE_MODELS.url;
  if (!endpoint.endsWith("/chat/completions")) {
    endpoint = `${endpoint.replace(/\/+$/, "")}/chat/completions`;
  }

  const model = OPENSOURCE_MODELS.model;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.5,
      max_tokens: opts.maxTokens ?? 2500,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
    signal: AbortSignal.timeout(35_000),
  });

  if (res.ok) {
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const text = Array.isArray(content)
      ? content.map((c: { text?: string }) => c.text ?? "").join("")
      : String(content ?? "");
    return text.trim();
  }

  if (res.status === 429) openSourcePausedUntil = Date.now() + COOLDOWN_MS;
  throw new Error(`OpenSource ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/* =========================================================================
   ORCHESTRATEUR PRINCIPAL AVEC CASCADE EN CAS DE PANNE
   1. Mistral (défaut)
   2. Gemini Flash (plan gratuit Google AI Studio)
   3. Open-Source (HuggingFace / OpenRouter / Groq / Local)
   ========================================================================= */
export async function chat(
  messages: ChatMessage[],
  opts: { model?: string; json?: boolean; temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  // 1. Essai Mistral
  if (hasMistral() && Date.now() >= mistralPausedUntil) {
    try {
      return await callMistral(messages, opts);
    } catch (err) {
      console.warn("[ai-fallback] Mistral a échoué, bascule vers Google Gemini...", err instanceof Error ? err.message : err);
    }
  }

  // 2. Bascule vers Google Gemini (Plan gratuit)
  if (hasGemini() && Date.now() >= geminiPausedUntil) {
    try {
      return await callGemini(messages, opts);
    } catch (err) {
      console.warn("[ai-fallback] Gemini a échoué, bascule vers modèles Open-Source...", err instanceof Error ? err.message : err);
    }
  }

  // 3. Bascule vers Open-Source
  if (hasOpenSource() && Date.now() >= openSourcePausedUntil) {
    try {
      return await callOpenSource(messages, opts);
    } catch (err) {
      console.warn("[ai-fallback] Modèles Open-Source externes indisponibles...", err instanceof Error ? err.message : err);
    }
  }

  throw new Error("Aucun fournisseur d'IA externe n'a pu répondre. Bascule sur le moteur local.");
}

/** Appel qui garantit un objet JSON avec nettoyage des balises Markdown */
export async function chatJson<T>(messages: ChatMessage[], opts: Parameters<typeof chat>[1] = {}): Promise<T> {
  const raw = await chat(messages, { ...opts, json: true });
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned) as T;
}

/** Transcription vocale avec repli gracieux */
export async function transcribe(file: Blob, filename: string, language = "fr"): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("Clé de transcription absente");

  const form = new FormData();
  form.append("model", MODELS.transcription);
  form.append("file", file, filename);
  form.append("language", language);

  const res = await fetch(`${MISTRAL_API}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) throw new Error(`Transcription HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return String(data.text ?? "");
}
