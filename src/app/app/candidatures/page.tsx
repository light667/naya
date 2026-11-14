"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Badge, Button, ButtonLink, Empty, PageHeader, Stepper, Tabs } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { STATUS_LABELS, type Application, type ApplicationStatus } from "@/lib/types";

const STEPS = ["À postuler", "Envoyée", "Entretien", "Réponse"];
const STEP_INDEX: Record<ApplicationStatus, number> = { a_postuler: 0, envoyee: 1, entretien: 2, acceptee: 3, refusee: 3 };

const NEXT: Record<ApplicationStatus, { to: ApplicationStatus; label: string; variant: "primary" | "secondary" | "ghost" }[]> = {
  a_postuler: [{ to: "envoyee", label: "J'ai envoyé ma candidature", variant: "primary" }],
  envoyee: [
    { to: "entretien", label: "J'ai un rendez-vous", variant: "primary" },
    { to: "refusee", label: "Pas retenue", variant: "ghost" },
  ],
  entretien: [
    { to: "acceptee", label: "Je suis retenue", variant: "primary" },
    { to: "refusee", label: "Pas retenue", variant: "ghost" },
  ],
  acceptee: [],
  refusee: [{ to: "a_postuler", label: "Rouvrir", variant: "ghost" }],
};

export default function CandidaturesPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [apps, setApps] = useState<Application[] | null>(null);
  const [tab, setTab] = useState<"cours" | "fini">("cours");
  const [openNotes, setOpenNotes] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    supabase.from("applications").select("*, opportunities(*)").eq("user_id", profile.id).order("updated_at", { ascending: false }).then(({ data }) => setApps((data as Application[]) ?? []));
  }, [profile]);

  async function update(id: string, patch: Partial<Application>, message?: string) {
    const updated_at = new Date().toISOString();
    setApps((list) => list!.map((a) => (a.id === id ? { ...a, ...patch, updated_at } : a)));
    const { error } = await supabase.from("applications").update({ ...patch, updated_at }).eq("id", id);
    if (error) toast(error.message, "error");
    else if (message) toast(message);
  }

  async function remove(id: string) {
    setApps((list) => list!.filter((a) => a.id !== id));
    const { error } = await supabase.from("applications").delete().eq("id", id);
    toast(error ? error.message : "Mission retirée du suivi", error ? "error" : "success");
  }

  const done = (a: Application) => a.status === "acceptee" || a.status === "refusee";
  const shown = (apps ?? []).filter((a) => (tab === "fini" ? done(a) : !done(a)));

  return (
    <div>
      <PageHeader title="Suivi" subtitle="Où en est chaque mission, et ce qu'il reste à faire." />

      {apps && apps.length > 0 && (
        <div className="mb-6">
          <Tabs
            tabs={[
              { id: "cours", label: `En cours (${apps.filter((a) => !done(a)).length})` },
              { id: "fini", label: `Terminées (${apps.filter(done).length})` },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>
      )}

      {apps === null ? (
        <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-40 animate-pulse rounded-[22px] bg-white ring-1 ring-line" />)}</div>
      ) : apps.length === 0 ? (
        <Empty icon="☰" title="Rien à suivre pour l'instant" text="Ajoutez une mission à votre suivi depuis la liste des missions pour préparer votre candidature." action={<ButtonLink href="/app/opportunites" variant="accent">Voir les missions</ButtonLink>} />
      ) : shown.length === 0 ? (
        <Empty title={tab === "fini" ? "Aucune réponse pour l'instant" : "Tout est à jour"} text={tab === "fini" ? "Les missions acceptées ou refusées apparaîtront ici." : "Aucune candidature en cours. Trouvez votre prochaine mission."} action={tab === "cours" ? <ButtonLink href="/app/opportunites">Voir les missions</ButtonLink> : undefined} />
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {shown.map((a) => (
              <motion.li
                key={a.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="rounded-[22px] bg-white p-5 ring-1 ring-line sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/app/opportunites?o=${a.opportunity_id}`} className="text-lg font-bold leading-snug text-ink hover:text-plum">{a.opportunities?.title}</Link>
                    <p className="text-sm text-muted">{a.opportunities?.organization}, mis à jour le {new Date(a.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
                  </div>
                  <Badge tone={a.status === "acceptee" ? "sage" : a.status === "refusee" ? "red" : "plum"}>{STATUS_LABELS[a.status]}</Badge>
                </div>

                <div className="mt-5">
                  <Stepper steps={STEPS} current={STEP_INDEX[a.status]} failed={a.status === "refusee"} />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {a.status === "a_postuler" && <ButtonLink href={`/app/assistant?mode=candidature&o=${a.opportunity_id}`} variant="accent">Rédiger ma candidature</ButtonLink>}
                  {a.status === "entretien" && <ButtonLink href={`/app/assistant?mode=entretien&o=${a.opportunity_id}`} variant="accent">Préparer le rendez-vous</ButtonLink>}
                  {NEXT[a.status].map((n) => (
                    <Button
                      key={n.to}
                      variant={a.status === "a_postuler" || a.status === "entretien" ? (n.variant === "primary" ? "secondary" : n.variant) : n.variant}
                      onClick={() => update(a.id, { status: n.to }, n.to === "acceptee" ? "Félicitations, vous êtes retenue !" : `Statut : ${STATUS_LABELS[n.to]}`)}
                    >
                      {n.label}
                    </Button>
                  ))}
                  <button onClick={() => setOpenNotes(openNotes === a.id ? null : a.id)} className="ml-auto rounded-full px-3 py-2 text-sm font-semibold text-muted hover:bg-plum-50 hover:text-plum" aria-expanded={openNotes === a.id}>
                    {a.notes ? "Mes notes" : "Ajouter une note"}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {openNotes === a.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <textarea
                        defaultValue={a.notes}
                        onBlur={(e) => e.target.value !== a.notes && update(a.id, { notes: e.target.value }, "Note enregistrée")}
                        placeholder="Date d'envoi, nom du contact, prochaine étape…"
                        rows={3}
                        autoFocus
                        className="mt-4 w-full resize-none rounded-2xl border border-line bg-bg px-4 py-3 text-[15px] focus:border-plum focus:outline-none focus:ring-4 focus:ring-plum/10"
                      />
                      <button onClick={() => remove(a.id)} className="mt-2 text-sm font-semibold text-red-700 hover:underline">Retirer cette mission du suivi</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
