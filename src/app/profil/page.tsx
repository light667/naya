"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button, Input, Sheet, Textarea } from "@/components/ui";
import { SkillList } from "@/components/SkillList";
import { SkillCard } from "@/components/SkillCard";
import { useToast } from "@/components/Toast";
import { writeSkills } from "@/lib/skills-client";
import type { Skill } from "@/lib/types";

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  created_at: string;
};

export default function ProfilPage() {
  const { session, profile, loading, setProfile } = useAuth();
  const toast = useToast();

  async function saveSkills(next: Skill[]) {
    if (!profile) return;
    const prev = profile;
    setProfile({ ...profile, skills: next }); // affichage immédiat
    try {
      setProfile(await writeSkills(profile, next));
    } catch (e) {
      setProfile(prev);
      toast((e as Error).message, "error");
    }
  }
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      if (!session?.user?.id) return;
      const { data } = await supabase.from("portfolio_items").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
      if (data) setPortfolioItems(data as PortfolioItem[]);
    }
    loadPortfolio();
  }, [session]);

  async function handleAddPortfolioItem(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id || !newTitle.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("portfolio_items")
      .insert({ user_id: session.user.id, title: newTitle.trim(), description: newDesc.trim() })
      .select()
      .single();
    if (!error && data) {
      setPortfolioItems((prev) => [data as PortfolioItem, ...prev]);
      setNewTitle("");
      setNewDesc("");
      setShowAddModal(false);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Chargement…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-16 sm:px-6">
          <h1 className="text-[32px] font-semibold leading-[1.15] text-ink">Ton profil</h1>
          <p className="mt-3 text-lg text-muted">Connecte-toi pour voir ta carte de compétences et tes réalisations.</p>
          <Link
            href="/connexion"
            className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-sun px-6 text-base font-semibold text-white transition-colors hover:bg-sun-700"
          >
            Me connecter
          </Link>
          <Link href="/connexion?mode=inscription" className="mt-2 flex min-h-12 items-center justify-center text-sm text-muted hover:text-ink">
            Créer un compte
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const fullName = profile?.full_name || session?.user?.user_metadata?.full_name || "";
  const headline = profile?.headline;
  const bio = profile?.bio;
  const city = profile?.city;
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const subtitle = [headline, city].filter(Boolean).join(" · ");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Une seule chose à regarder : qui tu es, et ajouter ton travail */}
        <section className="flex items-start gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl font-semibold text-ink ring-1 ring-line sm:h-20 sm:w-20" aria-hidden>
            {(fullName[0] || "?").toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="text-[32px] font-semibold leading-[1.15] text-ink sm:text-4xl">{fullName || "Ton profil"}</h1>
            {subtitle ? <p className="mt-1 text-lg text-muted">{subtitle}</p> : <p className="mt-1 text-lg text-muted">Ajoute ton métier et ta ville</p>}
          </div>
        </section>
        {bio && <p className="mt-6 max-w-xl text-base text-slate-700">{bio}</p>}
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-sun px-6 text-base font-semibold text-white transition-colors hover:bg-sun-700 active:scale-[0.98] sm:w-auto"
        >
          Ajouter un travail réalisé
        </button>

        {/* Le reste, en retrait */}
        <section className="mt-16">
          <h2 className="text-lg font-semibold text-ink">Mes compétences</h2>
          {skills.length > 0 ? (
            <>
              <div className="mt-4">
                <SkillCard firstName={(fullName || "").split(/\s+/)[0] || "Moi"} trade={headline || "Métier à préciser"} city={city || "Ville à préciser"} skills={skills.slice(0, 6).map((s) => (typeof s === "string" ? s : s.name))} />
              </div>
              <div className="mt-6">
                <SkillList skills={skills} editable onChange={saveSkills} />
              </div>
            </>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-muted">Pas encore de compétences. Réponds à quelques questions simples, l&apos;assistant les repère pour toi.</p>
              <Link href="/app/decouverte" className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-slate-800">
                Révéler mes compétences
              </Link>
              <div className="mt-4">
                <SkillList skills={[]} editable onChange={saveSkills} />
              </div>
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-ink">Mes réalisations</h2>
            <span className="text-xs tabular-nums text-muted">{portfolioItems.length}</span>
          </div>
          {portfolioItems.length > 0 ? (
            <ul className="mt-4 divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
              {portfolioItems.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <h3 className="text-base font-medium text-ink">{item.title}</h3>
                  {item.description && <p className="mt-1 line-clamp-3 text-sm text-muted">{item.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Pas encore de réalisation. Une photo de ton travail rassure les employeurs.</p>
          )}
        </section>
      </main>

      <Sheet
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter un travail réalisé"
        footer={
          <Button variant="accent" type="submit" form="add-item" loading={saving} className="w-full">
            Ajouter
          </Button>
        }
      >
        <h2 className="text-2xl font-semibold text-ink">Ajouter un travail réalisé</h2>
        <form id="add-item" onSubmit={handleAddPortfolioItem} className="mt-6 space-y-4">
          <Input label="Ce que tu as fait" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex. 5 tenues en wax sur mesure" />
          <Textarea label="Quelques détails (facultatif)" rows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Les tissus, le temps passé, le résultat" />
        </form>
      </Sheet>

      <Footer />
    </div>
  );
}
