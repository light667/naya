"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { CompassIcon, HandshakeIcon, MapPinIcon, ClockIcon, LightbulbIcon, CheckIcon } from "@/components/PharIcons";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  category: string;
  location: string;
  created_at: string;
  skills: string[];
};

type Application = {
  id: string;
  status: string;
  opportunity: Opportunity;
};

export default function DashboardPage() {
  const { session, profile, loading: authLoading } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const userName = profile?.full_name || session?.user?.user_metadata?.full_name || session?.user?.email?.split("@")[0] || "Talent";
  const userHeadline = profile?.headline || "Cap en cours de définition";

  // Calcul dynamique de progression de profil réel
  let completion = 25; // Compte créé
  if (profile?.city || profile?.bio) completion += 25;
  if (profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0) completion += 25;
  if (applications.length > 0) completion += 25;

  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      // Charger les opportunités vérifiées réelles
      const { data: opps } = await supabase
        .from("opportunities")
        .select("*")
        .eq("status", "verifiee")
        .order("created_at", { ascending: false })
        .limit(4);

      if (opps) setOpportunities(opps as Opportunity[]);

      // Charger les candidatures réelles de l'utilisateur
      if (session?.user?.id) {
        const { data: apps } = await supabase
          .from("applications")
          .select("id, status, opportunity:opportunities(*)")
          .eq("user_id", session.user.id);

        if (apps) setApplications(apps as unknown as Application[]);
      }
      setLoadingData(false);
    }

    if (!authLoading) {
      loadData();
    }
  }, [session, authLoading]);

  return (
    <div className="space-y-8">
      
      {/* 1. BANNIÈRE DE BIENVENUE AVEC PHOTO & PROGRESSION DU CAP */}
      <section className="relative rounded-[32px] overflow-hidden shadow-sm min-h-[240px] flex items-center p-8 sm:p-12 border border-[#E2ECF2]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/atelier-wide.jpg"
            alt="Atelier"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-white/95 sm:via-white/90 to-transparent" />

        <div className="relative z-20 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#22C3C9]/15 text-[#129aa0] px-3.5 py-1 rounded-full text-xs font-extrabold mb-3">
            {userHeadline}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A2A5C] mb-3 leading-tight">
            Heureux de te retrouver, {userName} !
          </h1>
          <p className="text-sm sm:text-base text-[#536B88] mb-6 leading-relaxed">
            Bienvenue sur ton espace PHAR. Ici, chaque expérience que tu as vécue a de la valeur pour ton avenir professionnel.
          </p>

          {/* Jauge de progression du profil réel */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2ECF2] shadow-sm max-w-md">
            <div className="flex justify-between text-xs font-bold text-[#0A2A5C] mb-2">
              <span>Complétude de ton profil</span>
              <span className="text-[#129aa0]">{completion}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#E8F4F7] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#22C3C9] to-[#FFB81C] rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. GRILLE PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        
        {/* COLONNE GAUCHE : ACTIONS RECOMMANDÉES & OPPORTUNITÉS */}
        <div className="space-y-8">
          
          {/* ACTIONS RECOMMANDÉES */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-extrabold text-[#0A2A5C]">
                Actions recommandées pour ton cap
              </h2>
            </div>

            <div className="space-y-3">
              {completion < 75 && (
                <div className="bg-white border border-[#E2ECF2] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm hover:border-[#22C3C9] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#FFB81C]/20 text-[#0A2A5C] flex items-center justify-center shrink-0">
                      <CompassIcon className="w-5 h-5 text-[#0A2A5C]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0A2A5C]">
                        Identifier tes compétences avec l'Assistant PHAR IA
                      </h3>
                      <p className="text-xs text-[#536B88]">
                        Échange en langage simple pour faire émerger tes savoir-faire de terrain
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/assistant-ia"
                    className="bg-[#EFFAFB] text-[#0A2A5C] hover:bg-[#FFB81C] text-xs font-extrabold px-4 py-2 rounded-xl transition-colors shrink-0"
                  >
                    Démarrer
                  </Link>
                </div>
              )}

              <div className="bg-white border border-[#E2ECF2] rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm hover:border-[#22C3C9] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#22C3C9]/15 text-[#129aa0] flex items-center justify-center shrink-0">
                    <HandshakeIcon className="w-5 h-5 text-[#129aa0]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0A2A5C]">
                      Rejoindre les discussions de l'Équipage
                    </h3>
                    <p className="text-xs text-[#536B88]">
                      Échange avec d'autres talents et pose tes questions aux mentors
                    </p>
                  </div>
                </div>
                <Link
                  href="/communaute"
                  className="bg-[#EFFAFB] text-[#0A2A5C] hover:bg-[#FFB81C] text-xs font-extrabold px-4 py-2 rounded-xl transition-colors shrink-0"
                >
                  Découvrir
                </Link>
              </div>
            </div>
          </div>

          {/* CANDIDATURES ACTIVES */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-extrabold text-[#0A2A5C]">
                Mes candidatures en cours
              </h2>
            </div>

            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white border border-[#E2ECF2] rounded-2xl p-4 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-[#0A2A5C]">
                        {app.opportunity?.title || "Candidature"}
                      </h3>
                      <p className="text-xs text-[#536B88]">
                        {app.opportunity?.organization}
                      </p>
                    </div>
                    <span className="bg-[#EFFAFB] text-[#129aa0] text-xs font-extrabold px-3 py-1 rounded-full">
                      {app.status === "envoyee" ? "Envoyée" : app.status === "entretien" ? "Entretien" : "En cours"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E2ECF2] rounded-2xl p-6 text-center shadow-sm">
                <p className="text-sm text-[#536B88] mb-3">
                  Tu n'as pas encore postulé à une opportunité.
                </p>
                <Link
                  href="/opportunites"
                  className="inline-block bg-[#0A2A5C] hover:bg-[#0d3470] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
                >
                  Explorer les offres disponibles
                </Link>
              </div>
            )}
          </div>

          {/* OPPORTUNITÉS RECOMMANDÉES */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-extrabold text-[#0A2A5C]">
                Dernières opportunités vérifiées
              </h2>
              <Link href="/opportunites" className="text-xs font-extrabold text-[#129aa0] hover:underline">
                Voir toutes les offres →
              </Link>
            </div>

            {opportunities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="bg-white rounded-2xl p-5 border border-[#E2ECF2] shadow-sm flex flex-col justify-between hover:border-[#22C3C9] transition-all"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#129aa0] block mb-1">
                        {opp.organization}
                      </span>
                      <h3 className="font-bold text-sm text-[#0A2A5C] mb-2 leading-snug">
                        {opp.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-[#536B88] mb-3">
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-3.5 h-3.5 text-[#22C3C9]" /> {opp.location || "Local"}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/opportunites"
                      className="w-full text-center bg-[#0A2A5C] hover:bg-[#0d3470] text-white font-bold text-xs py-2 rounded-xl transition-colors"
                    >
                      Consulter l'offre
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E2ECF2] rounded-2xl p-6 text-center shadow-sm">
                <p className="text-sm text-[#536B88]">
                  De nouvelles opportunités partenaires sont en cours de validation par l'équipe PHAR.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* COLONNE DROITE : FORMATIONS & CONSEILS */}
        <div className="space-y-6">
          
          {/* CATALOGUE FORMATIONS */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2ECF2] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-extrabold text-base text-[#0A2A5C]">
                Formations Pratiques
              </h3>
              <Link href="/formations" className="text-xs font-bold text-[#129aa0]">
                Voir tout
              </Link>
            </div>
            <p className="text-xs text-[#536B88] mb-4">
              Des parcours courts certifiés pour perfectionner tes savoir-faire de terrain.
            </p>
            <Link
              href="/formations"
              className="block w-full text-center bg-[#EFFAFB] hover:bg-[#FFB81C] text-[#0A2A5C] font-extrabold text-xs py-2.5 rounded-xl transition-colors"
            >
              Parcourir le catalogue
            </Link>
          </div>

          {/* CONSEIL DU PHAR IA */}
          <div className="bg-gradient-to-br from-[#EFFAFB] to-[#FFF8E6] border border-[#22C3C9]/30 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#129aa0] uppercase tracking-wider mb-2">
              <LightbulbIcon className="w-4 h-4 text-[#FFB81C]" />
              <span>Conseil PHAR IA</span>
            </div>
            <p className="text-xs text-[#0A2A5C] leading-relaxed">
              « Chaque expérience pratique, même acquise dans un atelier familial ou lors de ventes au marché, constitue une compétence valorisable. Raconte ton parcours à l'Assistant IA pour éclairer ton cap. »
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
