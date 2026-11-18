"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapPinIcon, CompassIcon, BuildingIcon } from "@/components/PharIcons";
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
        console.error(err);
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
        if (!inTitle && !inOrg) return false;
      }
      return true;
    });
  }, [offers, selectedType, selectedCity, search]);

  return (
    <div className="min-h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C]">
      <Navbar />

      {/* EN-TÊTE ÉPURÉ */}
      <section className="bg-gradient-to-b from-white to-[#EFFAFB] border-b border-[#E2ECF2] px-6 lg:px-12 py-8">
        <div className="max-w-[1320px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#22C3C9] block">
                Horizon Emploi
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2A5C]">
                Opportunités Vérifiées
              </h1>
            </div>
            <Link
              href="/connexion?mode=inscription&role=entreprise"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#129aa0] hover:text-[#0A2A5C] transition-colors"
            >
              <BuildingIcon className="w-3.5 h-3.5" /> Entreprise ? Publier une offre
            </Link>
          </div>

          {/* BARRE DE RECHERCHE RAPIDE */}
          <div className="bg-white rounded-2xl p-3 border border-[#E2ECF2] shadow-xs grid grid-cols-1 sm:grid-cols-[1fr_200px_200px_auto] gap-2.5 items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un métier, une entreprise..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2ECF2] text-xs text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
            />

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECF2] text-xs text-[#0A2A5C] bg-white outline-none focus:border-[#22C3C9]"
            >
              <option value="all">Tous les types</option>
              <option value="entreprise">Entreprise</option>
              <option value="association">Association</option>
              <option value="particulier">Atelier / Particulier</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E2ECF2] text-xs text-[#0A2A5C] bg-white outline-none focus:border-[#22C3C9]"
            >
              <option value="all">Toutes les villes</option>
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
                className="bg-[#EFFAFB] text-[#0A2A5C] font-bold text-xs px-3 py-2.5 rounded-xl whitespace-nowrap"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 lg:px-12 py-8">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#22C3C9] border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs text-[#536B88]">Chargement...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E2ECF2] shadow-xs text-center max-w-lg mx-auto my-6">
            <CompassIcon className="w-10 h-10 text-[#22C3C9] mx-auto mb-3 opacity-70" />
            <h2 className="font-display font-extrabold text-base text-[#0A2A5C] mb-1">
              Aucune offre pour le moment
            </h2>
            <p className="text-xs text-[#536B88] mb-5">
              Les opportunités vérifiées de nos ateliers et entreprises partenaires apparaîtront ici dès validation.
            </p>
            <Link
              href="/connexion?mode=inscription"
              className="inline-block bg-[#FFB81C] hover:bg-[#ffc138] text-[#0A2A5C] font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
            >
              Créer mon profil candidat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E2ECF2] shadow-xs hover:border-[#22C3C9] transition-all flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-extrabold uppercase bg-[#EFFAFB] text-[#129aa0] px-2 py-0.5 rounded-md">
                      {offer.org_type || "Partenaire"}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#0A2A5C] bg-[#FFB81C] px-2 py-0.5 rounded-md">
                      Vérifiée
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#536B88] block">{offer.organization}</span>
                  <h3 className="font-display font-extrabold text-base text-[#0A2A5C] mb-2 leading-snug">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-[#536B88] line-clamp-2 mb-3">
                    {offer.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2ECF2] flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-[#536B88]">
                    <MapPinIcon className="w-3.5 h-3.5 text-[#22C3C9]" /> {offer.location || "Local"}
                  </span>
                  <Link
                    href={`/app/opportunites?o=${offer.id}`}
                    className="bg-[#0A2A5C] hover:bg-[#0d3470] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
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
