"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckIcon, MapPinIcon, CompassIcon, StarIcon } from "@/components/PharIcons";

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  created_at: string;
};

export default function ProfilPage() {
  const { session, profile, loading } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPortfolio() {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
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
      .insert({
        user_id: session.user.id,
        title: newTitle.trim(),
        description: newDesc.trim(),
      })
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xs font-semibold text-slate-500">Chargement de votre profil...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto flex flex-col justify-center text-center p-6 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4 text-xl">
            <CompassIcon className="w-6 h-6 text-slate-900" />
          </div>
          <h1 className="text-xl font-bold text-slate-950 mb-2">Connecte-toi à ton espace</h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Pour visualiser et gérer ton portfolio et tes compétences certifiées, connecte-toi à ton compte.
          </p>
          <Link
            href="/connexion"
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 px-6 rounded-xl transition-all shadow-xs"
          >
            Se connecter ou créer un compte
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const fullName = profile?.full_name || session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "Mon Profil";
  const headline = profile?.headline;
  const bio = profile?.bio;
  const city = profile?.city;
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />

      {/* HEADER BANNER PROFIL ÉPURÉ */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* AVATAR ÉPURÉ */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-xs">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-2 -right-1 bg-white border border-slate-200 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs">
              Talent
            </span>
          </div>

          {/* INFORMATIONS PRINCIPALES */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                {fullName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60" title="Talent Vérifié PHAR">
                <CheckIcon className="w-3 h-3 text-emerald-600" /> Profil actif
              </span>
            </div>

            {headline && (
              <p className="text-sm font-semibold text-slate-700 mb-2">
                {headline}
              </p>
            )}

            {bio ? (
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed mb-4">
                {bio}
              </p>
            ) : (
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mb-4">
                Aucune biographie renseignée pour le moment.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {city && (
                <span className="bg-slate-100 text-xs font-medium text-slate-700 px-3 py-1 rounded-md flex items-center gap-1.5">
                  <MapPinIcon className="w-3.5 h-3.5 text-slate-500" /> {city}
                </span>
              )}
              <span className="bg-slate-100 text-xs font-medium text-slate-700 px-3 py-1 rounded-md flex items-center gap-1.5">
                <CompassIcon className="w-3.5 h-3.5 text-slate-500" /> Membre du réseau PHAR
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all text-center shadow-xs"
            >
              + Ajouter une réalisation
            </button>
            <Link
              href="/app"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium text-xs px-5 py-2.5 rounded-xl transition-colors text-center"
            >
              Tableau de bord
            </Link>
          </div>

        </div>
      </section>

      {/* CONTENU EN 2 COLONNES */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-[1fr_1.8fr] gap-8 items-start">
        
        {/* COLONNE GAUCHE : COMPÉTENCES */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Compétences Identifiées
            </h2>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill: { name?: string } | string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-slate-50 border border-slate-200/80 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5"
                  >
                    <CheckIcon className="w-3 h-3 text-teal-600" />
                    {typeof skill === "string" ? skill : skill.name || "Compétence"}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 mb-3">
                  Aucune compétence répertoriée pour le moment.
                </p>
                <Link
                  href="/assistant-ia"
                  className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Révéler mes compétences avec l&apos;IA →
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
              Garanties &amp; Avantages
            </h2>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Accès prioritaire aux offres vérifiées</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Candidatures directes sur WhatsApp / email</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Zéro frais d&apos;inscription ou de dossier</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : PORTFOLIO RÉEL */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Portfolio &amp; Réalisations
            </h2>
            <span className="text-xs text-slate-400">
              {portfolioItems.length} réalisation{portfolioItems.length > 1 ? "s" : ""}
            </span>
          </div>

          {portfolioItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description || "Aucune description renseignée."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-sm font-semibold text-slate-900 mb-1">
                Ton portfolio est encore vide
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Ajoute tes premières créations (photos d&apos;atelier, confections, projets de vente) pour les présenter aux recruteurs partenaires.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-2xs"
              >
                + Ajouter un premier projet
              </button>
            </div>
          )}
        </div>

      </main>

      {/* MODAL D'AJOUT DE RÉALISATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-950 mb-1">
              Ajouter une réalisation
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Décris un travail pratique que tu as réalisé (vêtements, stand de marché, objet d&apos;art...).
            </p>

            <form onSubmit={handleAddPortfolioItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de la réalisation</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Confection de 5 tenues wax sur mesure"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explique ce que tu as fait, les matières, les finitions et le résultat..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:border-slate-900 resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-xs"
                >
                  {saving ? "Enregistrement..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
