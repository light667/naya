// Point d'entrée unique pour l'IA : Gemini en priorité, Mistral en secours, puis le moteur local (géré par l'appelant).
import { chat as mistralChat, aiAvailable as mistralAvailable, MistralRateLimitError, MODELS as MISTRAL_MODELS, type ChatMessage } from "./mistral";
import { geminiAvailable, geminiChat, GeminiRateLimitError, geminiStream, hasGemini, type Tier } from "./gemini";

export type { ChatMessage };
export type LlmOpts = { tier?: Tier; temperature?: number; maxTokens?: number; json?: boolean; schema?: object };

/** Niveaux de modèle : chaque fournisseur choisit son modèle concret. */
export const MODELS = { text: "text", fast: "fast", vision: "vision" } as const satisfies Record<Tier, Tier>;

export const aiAvailable = () => geminiAvailable() || mistralAvailable();
export const aiConfigured = () => hasGemini() || !!process.env.MISTRAL_API_KEY;
export const isRateLimit = (e: unknown) => e instanceof GeminiRateLimitError || e instanceof MistralRateLimitError;

async function viaMistral(messages: ChatMessage[], o: LlmOpts) {
  return mistralChat(messages, { model: MISTRAL_MODELS[o.tier ?? "text"], temperature: o.temperature, maxTokens: o.maxTokens, json: o.json || !!o.schema });
}

export async function chat(messages: ChatMessage[], o: LlmOpts = {}): Promise<string> {
  if (geminiAvailable()) {
    try {
      return await geminiChat(messages, o);
    } catch (e) {
      if (!mistralAvailable()) throw e;
      console.warn("[phar-ai] Gemini indisponible, bascule sur Mistral :", (e as Error).message);
    }
  }
  return viaMistral(messages, o);
}

/** Appel qui doit renvoyer un objet JSON ; tolère un éventuel bloc ```json. */
export async function chatJson<T>(messages: ChatMessage[], o: LlmOpts = {}): Promise<T> {
  const raw = await chat(messages, { ...o, json: true });
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(cleaned) as T;
}

/** Réponse en flux. Sans Gemini, Mistral répond en un seul morceau. */
export async function* chatStream(messages: ChatMessage[], o: LlmOpts = {}): AsyncGenerator<string> {
  if (geminiAvailable()) {
    let started = false;
    try {
      for await (const chunk of geminiStream(messages, o)) {
        started = true;
        yield chunk;
      }
      return;
    } catch (e) {
      // Une réponse déjà commencée ne repart pas sur un autre modèle (le texte serait en double).
      if (started || !mistralAvailable()) throw e;
      console.warn("[phar-ai] Gemini indisponible, bascule sur Mistral :", (e as Error).message);
    }
  }
  yield await viaMistral(messages, o);
}
