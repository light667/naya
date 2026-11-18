"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { CompassIcon, HandshakeIcon, MapPinIcon, LightbulbIcon } from "@/components/PharIcons";

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
  const userHeadline = profile?.headline || "Parcours en cours de valorisation";

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

      if (opps && opps.length > 0) {
        setOpportunities(opps as Opportunity[]);
      }

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
      
      {/* 1. BANNIÈRE DE BIENVENUE ÉPURÉE */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              {userHeadline}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Ravi de te retrouver, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Voici l&apos;état d&apos;avancement de tes compétences et de tes candidatures vérifiées.
            </p>
          </div>

          {/* JAUGE DE PROGRESSION DU PROFIL */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 w-full lg:w-72 shrink-0">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-900 mb-2">
              <span>Complétude du profil</span>
              <span className="text-slate-950 font-bold">{completion}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              {completion < 100 ? (
                <Link href="/profil" className="text-slate-900 hover:underline font-medium">
                  Compléter mes informations →
                </Link>
              ) : (
                <span className="text-emerald-700 font-medium">Profil complet et attractif ✓</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. GRILLE PRINCIPALE */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        
        {/* COLONNE GAUCHE : CANDIDATURES & RECOMMANDATIONS */}
        <div className="space-y-8">
          
          {/* ACTIONS PRIORITAIRES */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              Actions recommandées
            </h2>

            {completion < 75 && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs hover:border-slate-300 transition-all gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                    <CompassIcon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Révéler mes compétences avec l&apos;Assistant IA
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dialogue en direct pour traduire tes expériences de terrain en compétences certifiées.
                    </p>
                  </div>
                </div>
                <Link
                  href="/assistant-ia"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shrink-0 shadow-2xs"
                >
                  Démarrer
                </Link>
              </div>
            )}

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xs hover:border-slate-300 transition-all gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                  <HandshakeIcon className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Rejoindre les échanges de la Communauté
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Découvre les retours d&apos;expérience des ateliers et artisans en activité.
                  </p>
                </div>
              </div>
              <Link
                href="/communaute"
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold px-4 py-2 rounded-lg transition-all shrink-0"
              >
                Explorer
              </Link>
            </div>
          </div>

          {/* SUIVI DES CANDIDATURES */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Suivi de mes candidatures
              </h2>
              <span className="text-xs text-slate-400">
                {applications.length} candidature{applications.length > 1 ? "s" : ""}
              </span>
            </div>

            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{app.opportunity?.title || "Mission"}</div>
                      <div className="text-slate-500">{app.opportunity?.organization || "Entreprise"}</div>
                    </div>
                    <span className="bg-white border border-slate-200 text-slate-700 font-semibold px-2.5 py-1 rounded-md">
                      {app.status === "envoyee" ? "Envoyée" : app.status === "entretien" ? "Entretien" : "En cours"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                <p className="mb-3">Tu n&apos;as pas encore postulé à une opportunité vérifiée.</p>
                <Link
                  href="/opportunites"
                  className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-2xs"
                >
                  Voir les opportunités
                </Link>
              </div>
            )}
          </div>

          {/* DERNIÈRES OPPORTUNITÉS VÉRIFIÉES */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Dernières opportunités vérifiées
              </h2>
              <Link href="/opportunites" className="text-xs font-semibold text-slate-700 hover:text-slate-950">
                Voir toutes les offres →
              </Link>
            </div>

            {opportunities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                        {opp.organization}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mb-2 leading-snug">
                        {opp.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                        <MapPinIcon className="w-3.5 h-3.5 text-slate-400" /> {opp.location || "Local"}
                      </div>
                    </div>
                    <Link
                      href={`/app/assistant?mode=candidature&o=${opp.id}`}
                      className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-lg transition-all shadow-2xs"
                    >
                      Postuler
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center shadow-xs">
                <p className="text-xs text-slate-500 mb-2">
                  Aucune opportunité vérifiée pour le moment.
                </p>
                <Link href="/opportunites" className="text-xs font-semibold text-slate-900 hover:underline">
                  Consulter les offres disponibles →
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* COLONNE DROITE : FORMATIONS & CONSEILS */}
        <div className="space-y-6">
          
          {/* CATALOGUE FORMATIONS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Formations Pratiques
              </h3>
              <Link href="/formations" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                Voir tout
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Parcours courts de terrain pour perfectionner ta technique et sécuriser tes devis.
            </p>
            <Link
              href="/formations"
              className="block w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-900 font-semibold text-xs py-2 rounded-lg border border-slate-200 transition-colors"
            >
              Parcourir le catalogue
            </Link>
          </div>

          {/* CONSEIL CARRIÈRE */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2">
              <LightbulbIcon className="w-4 h-4 text-amber-500" />
              <span>Conseil d&apos;insertion</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              &ldquo;Même acquise dans un atelier familial ou au marché, toute expérience concrète a de la valeur. L&apos;assistant IA t&apos;aide à la traduire en compétences pour convaincre les recruteurs.&rdquo;
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
