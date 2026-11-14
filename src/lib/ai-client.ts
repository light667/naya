import { supabase } from "./supabase";

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  return `Bearer ${data.session?.access_token ?? ""}`;
}

export async function callAi<T>(payload: Record<string, unknown>): Promise<T & { source: "ia" | "local" }> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: await authHeader() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erreur IA");
  return res.json();
}

/** Envoie un enregistrement audio au serveur ; renvoie null si la transcription serveur n'est pas configurée. */
export async function transcribeAudio(blob: Blob, lang = "fr"): Promise<string | null> {
  const form = new FormData();
  form.append("file", blob, "dictee");
  form.append("lang", lang);
  const res = await fetch("/api/transcribe", { method: "POST", headers: { Authorization: await authHeader() }, body: form });
  const data = await res.json().catch(() => ({}));
  if (res.status === 503 && data.error === "no_key") return null;
  if (!res.ok) throw new Error(data.error ?? "Transcription impossible");
  return String(data.text ?? "");
}
