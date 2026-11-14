"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { Badge, Button, Empty, Input, PageHeader, Select, Tabs, Textarea, VerifiedBadge } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { DeleteAccount } from "@/components/DeleteAccount";
import { STATUS_LABELS, type Application, type Opportunity, type Profile } from "@/lib/types";

const EMPTY = { title: "", description: "", organization: "", org_type: "entreprise", category: "", skills: "", location: "", remote: false, pay: "", contact: "" };
const CATEGORIES = ["Communication digitale", "Design graphique", "Couture & mode", "Cuisine & traiteur", "Beauté & bien-être", "Commerce & vente", "Administration", "Éducation", "Événementiel", "Services à la personne", "Artisanat", "Agriculture", "Autre"];

type Tab = "publier" | "offres" | "recues";

export default function PublierPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("publier");
  const [form, setForm] = useState({ ...EMPTY, organization: profile?.full_name ?? "" });
  const [mine, setMine] = useState<Opportunity[]>([]);
  const [received, setReceived] = useState<Application[]>([]);
  const [people, setPeople] = useState<Record<string, Profile>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase.from("opportunities").select("*").eq("created_by", profile.id).order("created_at", { ascending: false });
    const list = (data as Opportunity[]) ?? [];
    setMine(list);
    if (!list.length) return;
    const { data: apps } = await supabase.from("applications").select("*").in("opportunity_id", list.map((o) => o.id)).neq("status", "a_postuler");
    const a = (apps as Application[]) ?? [];
    setReceived(a);
    if (a.length) {
      const { data: profs } = await supabase.from("profiles").select("*").in("id", [...new Set(a.map((x) => x.user_id))]);
      setPeople(Object.fromEntries(((profs as Profile[]) ?? []).map((p) => [p.id, p])));
    }
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("opportunities").insert({
      ...form,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      category: form.category || "Autre",
      created_by: profile!.id,
      status: "en_attente",
    });
    setBusy(false);
    if (error) return toast(`Publication impossible : ${error.message}`, "error");
    setForm({ ...EMPTY, organization: form.organization });
    toast("Mission envoyée en vérification");
    await load();
    setTab("offres");
  }

  const set = (k: keyof typeof EMPTY, v: string | boolean) => setForm({ ...form, [k]: v });

  return (
    <div>
      <PageHeader title="Mes offres" subtitle="Proposez des missions. Chacune est vérifiée par l'équipe NAYA avant d'être visible." />
      <Tabs
        tabs={[
          { id: "publier", label: "Publier" },
          { id: "offres", label: `Mes offres (${mine.length})` },
          { id: "recues", label: `Candidatures (${received.length})` },
        ]}
        value={tab}
        onChange={setTab}
      />

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-6">
          {tab === "publier" && (
            <form onSubmit={submit} className="grid gap-4 rounded-[22px] bg-white p-5 ring-1 ring-line sm:grid-cols-2 sm:p-6">
              <div className="sm:col-span-2"><Input label="Intitulé de la mission" required placeholder="Assistante réseaux sociaux" value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
              <div className="sm:col-span-2"><Textarea label="Description" required rows={4} placeholder="Tâches, durée, conditions de travail…" value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
              <Input label="Structure ou nom" required value={form.organization} onChange={(e) => set("organization", e.target.value)} />
              <Select label="Vous êtes" value={form.org_type} onChange={(e) => set("org_type", e.target.value)}>
                <option value="entreprise">Une entreprise</option>
                <option value="association">Une association</option>
                <option value="particulier">Un particulier</option>
              </Select>
              <Select label="Catégorie" value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Choisir</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
              <Input label="Rémunération" required placeholder="40 000 FCFA la mission" value={form.pay} onChange={(e) => set("pay", e.target.value)} />
              <Input label="Lieu" placeholder="Lomé, Tokoin" value={form.location} onChange={(e) => set("location", e.target.value)} />
              <Input label="Contact" required placeholder="E-mail ou téléphone" value={form.contact} onChange={(e) => set("contact", e.target.value)} />
              <div className="sm:col-span-2"><Input label="Compétences recherchées" hint="Séparées par des virgules" placeholder="Canva, rédaction, ponctualité" value={form.skills} onChange={(e) => set("skills", e.target.value)} /></div>
              <label className="flex items-center gap-3 text-[15px] font-medium sm:col-span-2">
                <input type="checkbox" checked={form.remote} onChange={(e) => set("remote", e.target.checked)} className="h-5 w-5 accent-[#2A1B6E]" />
                La mission peut se faire à distance
              </label>
              <div className="sm:col-span-2"><Button type="submit" variant="accent" loading={busy} className="w-full py-4 sm:w-auto sm:px-8">Envoyer en vérification</Button></div>
            </form>
          )}

          {tab === "offres" && (
            mine.length === 0 ? (
              <Empty icon="+" title="Aucune offre publiée" text="Publiez votre première mission : elle sera vérifiée sous peu." action={<Button variant="accent" onClick={() => setTab("publier")}>Publier une mission</Button>} />
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-[22px] bg-white ring-1 ring-line">
                {mine.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{o.title}</p>
                      <p className="text-sm text-muted">{received.filter((a) => a.opportunity_id === o.id).length} candidature(s) reçue(s)</p>
                    </div>
                    {o.status === "verifiee" ? <VerifiedBadge /> : o.status === "en_attente" ? <Badge tone="amber">En vérification</Badge> : <Badge tone="red">Refusée</Badge>}
                  </li>
                ))}
              </ul>
            )
          )}

          {tab === "recues" && (
            received.length === 0 ? (
              <Empty icon="✉" title="Pas encore de candidature" text="Les candidatures envoyées à vos offres en ligne apparaîtront ici." />
            ) : (
              <ul className="space-y-3">
                {received.map((a) => {
                  const p = people[a.user_id];
                  return (
                    <li key={a.id} className="rounded-[22px] bg-white p-5 ring-1 ring-line">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold text-ink">{p?.full_name ?? "Candidate"}</p>
                          <p className="text-sm text-muted">Pour « {mine.find((o) => o.id === a.opportunity_id)?.title} »</p>
                        </div>
                        <Badge tone="plum">{STATUS_LABELS[a.status]}</Badge>
                      </div>
                      {p && (
                        <div className="mt-3">
                          {p.headline && <p className="font-medium text-ink">{p.headline}</p>}
                          <p className="text-sm text-muted">{[p.city, p.availability].filter(Boolean).join(", ")}</p>
                          <div className="mt-3 flex flex-wrap gap-1.5">{p.skills.map((s) => <Badge key={s.name} tone="neutral">{s.name}</Badge>)}</div>
                        </div>
                      )}
                      {a.message && <p className="mt-4 whitespace-pre-line rounded-2xl bg-bg p-4 text-[15px] leading-relaxed">{a.message}</p>}
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </motion.div>
      </AnimatePresence>
      {profile?.role === "recruteur" && <DeleteAccount />}
    </div>
  );
}
