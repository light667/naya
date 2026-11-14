"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AssistantDraft, AssistantKind } from "@/lib/types";

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Sauvegarde automatique des contenus générés dans l'historique (table assistant_drafts). */
export function useDraft(kind: AssistantKind, userId: string | undefined) {
  const [id, setId] = useState<string | null>(null);
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const create = useCallback(
    async (d: Pick<AssistantDraft, "title" | "opportunity_id" | "params" | "analysis" | "content" | "checks">) => {
      if (!userId) return null;
      setState("saving");
      const { data, error } = await supabase.from("assistant_drafts").insert({ ...d, kind, user_id: userId }).select("id").single();
      if (error) { setState("error"); return null; }
      setId(data.id);
      setState("saved");
      return data.id as string;
    },
    [kind, userId],
  );

  /** Enregistre les modifications de l'utilisatrice (après 1 s sans frappe). */
  const update = useCallback((patch: Partial<Pick<AssistantDraft, "content" | "checks">>) => {
    if (!id) return;
    if (timer.current) clearTimeout(timer.current);
    setState("saving");
    timer.current = setTimeout(async () => {
      const { error } = await supabase.from("assistant_drafts").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
      setState(error ? "error" : "saved");
    }, 1000);
  }, [id]);

  const attach = useCallback((draftId: string | null) => { setId(draftId); setState(draftId ? "saved" : "idle"); }, []);

  return { id, state, create, update, attach };
}

export function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  const label = { saving: "Enregistrement…", saved: "Brouillon enregistré", error: "Historique indisponible" }[state];
  return (
    <span className={`text-[13px] ${state === "error" ? "text-red-700" : "text-muted"}`} title={state === "error" ? "Exécutez la migration 002 dans Supabase pour activer l'historique." : undefined}>
      {state === "saved" && "✓ "}{label}
    </span>
  );
}
