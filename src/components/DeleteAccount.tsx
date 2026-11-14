"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toast";
import { Button, Input, Sheet } from "./ui";
import { supabase } from "@/lib/supabase";
import { BUCKET } from "@/lib/media";

const CONFIRM_WORD = "SUPPRIMER";

/** Zone « Supprimer mon compte » : confirmation explicite, suppression des fichiers puis du compte. */
export function DeleteAccount() {
  const { profile, session } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  if (!profile) return null;
  const recruiter = profile.role === "recruteur";

  async function remove() {
    setBusy(true);
    try {
      // 1. Fichiers du portfolio (photos, vidéos, photo de profil)
      const { data: files } = await supabase.storage.from(BUCKET).list(profile!.id, { limit: 1000 });
      if (files?.length) await supabase.storage.from(BUCKET).remove(files.map((f) => `${profile!.id}/${f.name}`));
      // 2. Compte et données (fonction SQL sécurisée)
      const { error } = await supabase.rpc("delete_my_account");
      if (error) {
        throw new Error(error.message.includes("delete_my_account") || error.code === "PGRST202"
          ? "La suppression n'est pas encore activée : exécutez la migration 003 dans Supabase."
          : error.message);
      }
      await supabase.auth.signOut();
      toast("Votre compte et vos données ont été supprimés.");
      router.replace("/");
    } catch (e) {
      toast((e as Error).message, "error");
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 rounded-[22px] bg-white p-5 ring-1 ring-red-200 sm:p-6">
      <h2 className="text-lg font-bold text-red-800">Supprimer mon compte</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Toutes vos données seront définitivement effacées
        {recruiter ? " : profil, offres publiées et candidatures reçues." : " : profil, compétences, candidatures, portfolio (photos et vidéos comprises), lien public et historique de l'assistante."}
        {" "}Cette action est irréversible.
      </p>
      <Button variant="danger" className="mt-4" onClick={() => { setTyped(""); setOpen(true); }}>Supprimer mon compte</Button>

      <Sheet
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Supprimer mon compte"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" disabled={busy} onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="danger" className="!bg-red-700 !text-white !ring-0 hover:!bg-red-800" loading={busy} disabled={typed.trim().toUpperCase() !== CONFIRM_WORD} onClick={remove}>
              Supprimer définitivement
            </Button>
          </div>
        }
      >
        <h2 className="font-display pr-10 text-[28px] text-red-800">Supprimer votre compte ?</h2>
        <p className="mt-3 text-ink">
          Le compte <span className="font-semibold">{session?.user.email}</span> et toutes ses données seront effacés. Il ne sera pas possible de les récupérer.
        </p>
        <ul className="mt-4 space-y-1 rounded-2xl bg-red-50 p-4 text-sm text-red-900">
          <li>• Votre profil et vos compétences</li>
          {recruiter ? <li>• Vos offres publiées et les candidatures reçues</li> : (
            <>
              <li>• Vos candidatures et leur suivi</li>
              <li>• Votre portfolio, vos photos et vidéos, votre lien public</li>
              <li>• L&apos;historique de l&apos;assistante</li>
            </>
          )}
        </ul>
        <div className="mt-5">
          <Input label={`Pour confirmer, tapez ${CONFIRM_WORD}`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
        </div>
      </Sheet>
    </section>
  );
}
