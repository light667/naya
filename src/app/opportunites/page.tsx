"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapPinIcon, ClockIcon, CompassIcon, BuildingIcon } from "@/components/PharIcons";
import { supabase } from "@/lib/supabase";
import type { Opportunity } from "@/lib/types";

export default function OpportunitesPage() {
  const [offers, setOffers] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
        console.error("Erreur de chargement des opportunités:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, []);

  const cities = useMemo(() => {
    const list = offers.map((o) => o.location).filter(Boolean);
    return Array.from(new Set(list));
  }, [offers]);

  const categories = useMemo(() => {
    const list = offers.map((o) => o.category).filter(Boolean);
    return Array.from(new Set(list));
  }, [offers]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (selectedType !== "all" && offer.org_type !== selectedType) return false;
      if (selectedCity !== "all" && !offer.location.toLowerCase().includes(selectedCity.toLowerCase())) return false;
      if (selectedCategory !== "all" && offer.category !== selectedCategory) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const inTitle = offer.title.toLowerCase().includes(query);
        const inOrg = offer.organization.toLowerCase().includes(query);
        const inDesc = offer.description?.toLowerCase().includes(query);
        const inSkills = offer.skills?.some((s) => s.toLowerCase().includes(query));
        if (!inTitle && !inOrg && !inDesc && !inSkills) return false;
      }
      return true;
    });
  }, [offers, selectedType, selectedCity, selectedCategory, search]);

  return (
    <div className="min-h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C]">
      <Navbar />

      {/* BANNIÈRE EN-TÊTE AVEC FILTRES */}
      <section className="bg-gradient-to-b from-white to-[#EFFAFB] border-b border-[#E2ECF2] px-6 lg:px-12 py-12">
        <div className="max-w-[1320px] mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#22C3C9] mb-2 block">
            Horizon Emploi
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-[#0A2A5C] font-extrabold mb-3">
            EXPLORER LES OPPORTUNITÉS DU RÉSEAU PHAR
          </h1>
          <p className="text-[#536B88] text-base sm:text-lg max-w-2xl mb-8">
            Des stages tremplins, contrats d&apos;apprentissage et missions de terrain vérifiés, connectés aux savoir-faire réels de nos jeunes talents.
          </p>

          {/* BARRE DE RECHERCHE ET FILTRES DYNAMIQUES */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E2ECF2] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3.5 items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Métier, compétence (ex: coupe wax, vente, gestion...)"
              className="w-full px-4 py-3 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
            />

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] bg-white outline-none focus:border-[#22C3C9]"
            >
              <option value="all">Tous les types d&apos;organisation</option>
              <option value="entreprise">Entreprise</option>
              <option value="association">Association</option>
              <option value="particulier">Atelier / Particulier</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] bg-white outline-none focus:border-[#22C3C9]"
            >
              <option value="all">Toutes les villes</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-[#E2ECF2] text-sm text-[#0A2A5C] bg-white outline-none focus:border-[#22C3C9]"
            >
              <option value="all">Tous les domaines</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {(search || selectedType !== "all" || selectedCity !== "all" || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedType("all");
                  setSelectedCity("all");
                  setSelectedCategory("all");
                }}
                className="bg-[#EFFAFB] hover:bg-[#E2ECF2] text-[#0A2A5C] font-bold text-xs px-4 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CATALOGUE D'OFFRES RÉELLES */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 lg:px-12 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-extrabold text-[#0A2A5C]">
            {loading ? (
              <span>Chargement des opportunités...</span>
            ) : (
              <>
                <span className="text-[#22C3C9]">
                  {filteredOffers.length} {filteredOffers.length <= 1 ? "opportunité disponible" : "opportunités disponibles"}
                </span>{" "}
                sur la plateforme PHAR
              </>
            )}
          </div>
          <Link
            href="/connexion?mode=inscription&role=entreprise"
            className="text-xs font-bold text-[#129aa0] hover:text-[#0A2A5C] flex items-center gap-1 transition-colors"
          >
            <BuildingIcon className="w-4 h-4" /> Recruteur ? Publier une offre
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#22C3C9] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-[#536B88]">Recherche des opportunités en cours...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#E2ECF2] shadow-sm text-center max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#EFFAFB] text-[#22C3C9] mx-auto flex items-center justify-center mb-4">
              <CompassIcon className="w-8 h-8 text-[#22C3C9]" />
            </div>
            <h2 className="font-display font-extrabold text-xl text-[#0A2A5C] mb-2">
              {offers.length === 0
                ? "Nouvelles opportunités en cours de vérification"
                : "Aucune opportunité ne correspond à tes filtres"}
            </h2>
            <p className="text-sm text-[#536B88] mb-6 leading-relaxed">
              {offers.length === 0
                ? "La plateforme PHAR ouvre officiellement ses portes. Les offres vérifiées de nos entreprises, ateliers et coopératives partenaires apparaîtront ici dès leur validation."
                : "Essaie d'élargir ta recherche ou de réinitialiser les filtres pour découvrir toutes les offres disponibles."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/connexion?mode=inscription"
                className="bg-[#FFB81C] hover:bg-[#ffc138] text-[#0A2A5C] font-extrabold text-sm px-6 py-3 rounded-xl transition-all shadow-sm"
              >
                Créer mon profil candidat
              </Link>
              <Link
                href="/connexion?mode=inscription&role=entreprise"
                className="bg-[#0A2A5C] hover:bg-[#0d3470] text-white font-extrabold text-sm px-6 py-3 rounded-xl transition-all"
              >
                Publier une offre partenaire
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E2ECF2] shadow-sm hover:border-[#22C3C9] hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-44 bg-gradient-to-br from-[#0A2A5C] to-[#129aa0] p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-white/95 text-[#0A2A5C] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg">
                      {offer.org_type || "Partenaire"}
                    </span>
                    <span className="bg-[#FFB81C] text-[#0A2A5C] text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                      Vérifiée
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-white/80 font-bold block">{offer.organization}</span>
                    <h3 className="font-display font-extrabold text-base text-white leading-snug line-clamp-2">
                      {offer.title}
                    </h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#536B88] line-clamp-3 mb-4 leading-relaxed">
                      {offer.description}
                    </p>
                    {offer.skills && offer.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {offer.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="bg-[#EFFAFB] text-[#0A2A5C] text-[11px] font-bold px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-[#536B88] pt-3 border-t border-[#E2ECF2] mb-4">
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5 text-[#22C3C9]" /> {offer.location || "Non spécifié"}
                      </span>
                      {offer.pay && (
                        <span className="flex items-center gap-1 font-bold text-[#0A2A5C]">
                          {offer.pay}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/app/opportunites?o=${offer.id}`}
                      className="block w-full text-center bg-[#0A2A5C] hover:bg-[#0d3470] text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
                    >
                      Voir le détail &amp; postuler
                    </Link>
                  </div>
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
