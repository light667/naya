import { supabase } from "./supabase";

export async function callAi<T>(payload: Record<string, unknown>): Promise<T & { source: "ia" | "local" }> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erreur IA");
  return res.json();
}
