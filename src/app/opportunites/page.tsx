"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapPinIcon, BuildingIcon } from "@/components/PharIcons";
import { supabase } from "@/lib/supabase";
import type { Opportunity } from "@/lib/types";

export default function OpportunitesPage() {
  const [offers, setOffers] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        const { data, error } = await supabase
          .from("opportunities")
          .select("*")
          .eq("status", "verifiee")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOffers(data as Opportunity[]);
        }
      } catch (err) {
        console.warn("[opportunites] Erreur chargement offres:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunities();
  }, []);

  const cities = useMemo(() => {
    return Array.from(new Set(offers.map((o) => o.location).filter(Boolean)));
  }, [offers]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (selectedType !== "all" && offer.org_type !== selectedType) return false;
      if (selectedCity !== "all" && !offer.location?.toLowerCase().includes(selectedCity.toLowerCase())) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = offer.title?.toLowerCase().includes(q);
        const inOrg = offer.organization?.toLowerCase().includes(q);
        const inCat = offer.category?.toLowerCase().includes(q);
        if (!inTitle && !inOrg && !inCat) return false;
      }
      return true;
    });
  }, [offers, selectedType, selectedCity, search]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />

      {/* EN-TÊTE ÉPURÉ */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 block mb-1">
                Missions Modérées
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                Opportunités Vérifiées
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Stages rémunérés, contrats d&apos;apprentissage et missions de terrain garantis sans frais de dossier.
              </p>
            </div>

            <Link
              href="/connexion?mode=inscription&role=entreprise"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all self-start sm:self-center"
            >
              <BuildingIcon className="w-3.5 h-3.5 text-slate-600" /> Espace Recruteur : Déposer une offre
            </Link>
          </div>

          {/* FILTRES RAPIDES */}
          <div className="bg-slate-50/80 rounded-2xl p-2.5 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-[1fr_200px_200px_auto] gap-2 items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par métier, compétence ou entreprise..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 outline-none focus:border-slate-900 placeholder:text-slate-400"
            />

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-slate-900 font-medium"
            >
              <option value="all">Tous les types de structure</option>
              <option value="entreprise">Entreprise</option>
              <option value="association">Association / Coopérative</option>
              <option value="particulier">Atelier / Particulier</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-slate-900 font-medium"
            >
              <option value="all">Toutes les localisations</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {(search || selectedType !== "all" || selectedCity !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedType("all");
                  setSelectedCity("all");
                }}
                className="bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold text-xs px-3 py-2.5 rounded-xl whitespace-nowrap transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CATALOGUE DES MISSIONS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500">Chargement des opportunités vérifiées...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-xs text-center max-w-lg mx-auto my-8">
            <h2 className="font-bold text-base text-slate-900 mb-1">
              Aucune opportunité vérifiée pour le moment
            </h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Dès qu&apos;une entreprise ou un atelier partenaire publie une offre et qu&apos;elle est validée par notre équipe, elle sera affichée ici.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/connexion?mode=inscription&role=entreprise"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-xs hover:bg-slate-800 transition-all"
              >
                Publier une offre de recrutement
              </Link>
              <Link
                href="/assistant-ia"
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-all"
              >
                Préparer mon profil avec l&apos;IA
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {offer.category || offer.org_type || "Mission"}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Vérifiée
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    {offer.organization}
                  </span>

                  <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {offer.description}
                  </p>

                  {/* COMPÉTENCES RECHERCHÉES */}
                  {offer.skills && offer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {offer.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 text-[10px] font-medium text-slate-600"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <MapPinIcon className="w-3.5 h-3.5 text-slate-400" /> {offer.location || "Local"}
                    </span>
                    {offer.pay && (
                      <span className="text-[11px] font-semibold text-slate-900 mt-0.5">
                        {offer.pay}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/app/assistant?mode=candidature&o=${offer.id}`}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-all shadow-2xs"
                  >
                    Postuler
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
