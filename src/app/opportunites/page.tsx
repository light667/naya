"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapPinIcon } from "@/components/PharIcons";
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

  const fieldCls = "min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition-colors focus:border-sun placeholder:text-slate-400";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-[32px] font-semibold leading-[1.15] text-ink sm:text-4xl">Offres</h1>
        <p className="mt-2 max-w-xl text-base text-muted">Stages, apprentissages et missions, contrôlés avant d&apos;être publiés. Aucun frais demandé.</p>

        <div className="mt-8 grid gap-2 sm:grid-cols-[1fr_180px_180px]">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Métier ou entreprise" aria-label="Rechercher une offre" className={fieldCls} />
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} aria-label="Type de structure" className={fieldCls}>
            <option value="all">Tous les types</option>
            <option value="entreprise">Entreprise</option>
            <option value="association">Association</option>
            <option value="particulier">Atelier ou particulier</option>
          </select>
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} aria-label="Ville" className={fieldCls}>
            <option value="all">Toutes les villes</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        {(search || selectedType !== "all" || selectedCity !== "all") && (
          <button
            onClick={() => { setSearch(""); setSelectedType("all"); setSelectedCity("all"); }}
            className="mt-2 inline-flex min-h-11 items-center text-sm text-muted underline underline-offset-4 hover:text-ink"
          >
            Effacer les filtres
          </button>
        )}

        <div className="mt-10">
          {loading ? (
            <p className="py-16 text-center text-sm text-muted">Chargement des offres…</p>
          ) : filteredOffers.length === 0 ? (
            <div className="mx-auto max-w-md py-16 text-center">
              <h2 className="text-lg font-semibold text-ink">Aucune offre pour le moment</h2>
              <p className="mt-2 text-sm text-muted">En attendant, prépare ta carte de compétences pour être prêt le jour où une offre arrive.</p>
              <Link href="/assistant-ia" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-sun px-6 text-sm font-semibold text-white transition-colors hover:bg-sun-700">
                Créer ma carte de compétences
              </Link>
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((offer) => (
                <li key={offer.id} className="flex flex-col rounded-2xl bg-white p-6 ring-1 ring-line">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted">
                    <span className="truncate">{offer.category || "Mission"}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sage">
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden><path d="m4 8.5 2.5 2.5L12 5.5" /></svg>
                      Vérifiée
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold leading-snug text-ink">{offer.title}</h2>
                  <p className="mt-1 text-sm text-muted">{offer.organization}</p>
                  {offer.description && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{offer.description}</p>}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <div className="min-w-0">
                      {offer.pay && <p className="text-base font-semibold text-ink">{offer.pay}</p>}
                      <p className="flex items-center gap-1 text-xs text-muted">
                        <MapPinIcon className="h-3.5 w-3.5" /> {offer.remote ? "À distance" : offer.location || "Lieu à préciser"}
                      </p>
                    </div>
                    <Link href={`/app/assistant?mode=candidature&o=${offer.id}`} className="inline-flex min-h-11 shrink-0 items-center px-1 text-sm font-semibold text-sun hover:text-sun-700">
                      Postuler
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-16 text-sm text-muted">
          Tu recrutes ?{" "}
          <Link href="/connexion?mode=inscription&role=entreprise" className="font-medium text-ink underline underline-offset-4">
            Déposer une offre
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
