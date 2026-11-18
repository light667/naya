"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckIcon, MapPinIcon, CompassIcon, HandshakeIcon, StarIcon } from "@/components/PharIcons";

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
      <div className="min-h-screen bg-[#F8FCFD] flex items-center justify-center">
        <div className="text-sm font-bold text-[#0A2A5C]">Chargement de ton profil...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C]">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto flex flex-col justify-center text-center p-6">
          <div className="w-16 h-16 rounded-3xl bg-[#EFFAFB] text-[#22C3C9] flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            <CompassIcon className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl font-extrabold mb-2">Connecte-toi à ton espace</h1>
          <p className="text-sm text-[#536B88] mb-6">
            Pour visualiser et gérer ton portfolio et tes compétences validées par PHAR, connecte-toi à ton compte.
          </p>
          <Link
            href="/connexion"
            className="bg-[#0A2A5C] text-white font-extrabold text-sm py-3 px-6 rounded-xl hover:bg-[#0d3470] transition-colors"
          >
            Se connecter ou créer un compte
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const fullName = profile?.full_name || session?.user?.user_metadata?.full_name || "Talent Émergent";
  const headline = profile?.headline || "Cap professionnel en cours d'élaboration";
  const bio = profile?.bio || "Partage ton histoire et tes savoir-faire pour enrichir ton profil PHAR.";
  const city = profile?.city || "Afrique de l'Ouest";
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];

  return (
    <div className="min-h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C]">
      <Navbar />

      {/* HEADER BANNER PROFIL */}
      <section className="bg-gradient-to-b from-white to-[#EFFAFB] border-b border-[#E2ECF2] px-6 lg:px-12 pt-10 pb-12">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* AVATAR AVEC INITIALE DYNAMIQUE */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#22C3C9] to-[#0A2A5C] text-white flex items-center justify-center text-4xl font-extrabold border-4 border-white shadow-md">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-2 -right-2 bg-[#FFB81C] text-[#0A2A5C] text-[11px] font-extrabold px-3 py-1 rounded-full border-2 border-white shadow-sm">
              Cap Ouvert
            </span>
          </div>

          {/* INFORMATIONS PRINCIPALES */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2A5C]">
                {fullName}
              </h1>
              <span className="w-6 h-6 rounded-full bg-[#22C3C9]/15 text-[#129aa0] inline-flex items-center justify-center" title="Talent Vérifié PHAR">
                <CheckIcon className="w-3.5 h-3.5" />
              </span>
            </div>

            <p className="text-sm sm:text-base font-bold text-[#129aa0] mb-3">
              {headline}
            </p>

            <p className="text-sm text-[#536B88] max-w-2xl leading-relaxed mb-4">
              {bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="bg-white border border-[#E2ECF2] text-xs font-bold text-[#0A2A5C] px-3 py-1 rounded-lg flex items-center gap-1.5">
                <MapPinIcon className="w-3.5 h-3.5 text-[#22C3C9]" /> {city}
              </span>
              <span className="bg-white border border-[#E2ECF2] text-xs font-bold text-[#0A2A5C] px-3 py-1 rounded-lg flex items-center gap-1.5">
                <CompassIcon className="w-3.5 h-3.5 text-[#FFB81C]" /> Compte Vérifié PHAR
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#0A2A5C] hover:bg-[#0d3470] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-colors text-center shadow-sm"
            >
              + Ajouter une réalisation
            </button>
            <Link
              href="/app"
              className="bg-white hover:bg-[#EFFAFB] border border-[#E2ECF2] text-[#0A2A5C] font-bold text-xs px-6 py-2.5 rounded-xl transition-colors text-center"
            >
              Aller à Mon Cap
            </Link>
          </div>

        </div>
      </section>

      {/* CONTENU EN 2 COLONNES : COMPÉTENCES & PORTFOLIO RÉEL */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 items-start">
        
        {/* COLONNE GAUCHE : COMPÉTENCES RECONNUES & BADGES */}
        <div className="space-y-6">
          
          {/* COMPÉTENCES DU PROFIL RÉEL */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2ECF2] shadow-sm">
            <h2 className="font-display font-extrabold text-base text-[#0A2A5C] mb-4">
              Compétences Repérées
            </h2>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: any, idx: number) => (
                  <span
                    key={idx}
                    className="bg-[#EFFAFB] text-[#0A2A5C] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                  >
                    <CheckIcon className="w-3 h-3 text-[#129aa0]" />
                    {typeof skill === "string" ? skill : skill.name || "Compétence"}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-[#536B88] mb-3">
                  Aucune compétence répertoriée pour le moment.
                </p>
                <Link
                  href="/assistant-ia"
                  className="inline-block bg-[#EFFAFB] hover:bg-[#FFB81C] text-[#0A2A5C] text-xs font-extrabold px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  Révéler mes compétences avec l'IA →
                </Link>
              </div>
            )}
          </div>

          {/* BADGES PHAR */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2ECF2] shadow-sm">
            <h2 className="font-display font-extrabold text-base text-[#0A2A5C] mb-4">
              Accréditations PHAR
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E2ECF2] bg-[#FDFEFE]">
                <div className="w-10 h-10 rounded-xl bg-[#FFB81C]/20 text-[#0A2A5C] flex items-center justify-center shrink-0">
                  <CompassIcon className="w-5 h-5 text-[#0A2A5C]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#0A2A5C]">Profil PHAR Actif</h3>
                  <p className="text-[11px] text-[#536B88]">Reconnaissance des parcours d'inclusion</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E2ECF2] bg-[#FDFEFE]">
                <div className="w-10 h-10 rounded-xl bg-[#22C3C9]/15 text-[#129aa0] flex items-center justify-center shrink-0">
                  <StarIcon className="w-4 h-4 text-[#129aa0]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#0A2A5C]">Accès Réseau Partenaires</h3>
                  <p className="text-[11px] text-[#536B88]">Candidature directe aux offres vérifiées</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLONNE DROITE : PORTFOLIO RÉEL */}
        <div className="space-y-8">
          
          <div className="bg-white rounded-2xl p-6 border border-[#E2ECF2] shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-extrabold text-base text-[#0A2A5C]">
                Portfolio &amp; Réalisations
              </h2>
              <span className="text-xs font-bold text-[#129aa0]">
                {portfolioItems.length} réalisation{portfolioItems.length > 1 ? "s" : ""}
              </span>
            </div>

            {portfolioItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#E2ECF2] p-4 bg-[#F8FCFD] flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-[#0A2A5C] mb-1">{item.title}</h3>
                      <p className="text-xs text-[#536B88] line-clamp-3 leading-relaxed">
                        {item.description || "Aucune description renseignée."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-[#E2ECF2] rounded-xl bg-[#F8FCFD]">
                <p className="text-sm font-semibold text-[#0A2A5C] mb-1">
                  Ton portfolio est encore vide
                </p>
                <p className="text-xs text-[#536B88] max-w-sm mx-auto mb-4">
                  Ajoute tes premières créations (photos d'atelier, confections, projets de vente) pour les présenter aux recruteurs.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#FFB81C] hover:bg-[#ffc138] text-[#0A2A5C] font-extrabold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  + Ajouter un premier projet
                </button>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* MODAL D'AJOUT DE RÉALISATION */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E2ECF2]">
            <h3 className="font-display font-extrabold text-lg text-[#0A2A5C] mb-2">
              Ajouter une réalisation
            </h3>
            <p className="text-xs text-[#536B88] mb-5">
              Décris un travail pratique que tu as réalisé (vêtements, stand de marché, objet d'art...).
            </p>

            <form onSubmit={handleAddPortfolioItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A2A5C] mb-1">Titre du projet</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Confection de 5 robes d'été en wax"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A2A5C] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explique ce que tu as fait, les matériaux utilisés, le résultat..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[#E2ECF2] rounded-xl text-xs font-bold text-[#536B88] hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#0A2A5C] text-white rounded-xl text-xs font-bold hover:bg-[#0d3470] transition-colors disabled:opacity-50"
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
