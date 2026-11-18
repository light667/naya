"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClockIcon, MapPinIcon } from "@/components/PharIcons";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type Course = {
  id: string;
  cat: string;
  categoryKey: string;
  title: string;
  desc: string;
  duration: string;
  mode: string;
  img: string;
  skillsAcquired: string[];
};

const COURSES: Course[] = [
  {
    id: "patronage-wax",
    cat: "Confection & Mode",
    categoryKey: "textile",
    title: "Patronage & Coupe Wax Précise",
    desc: "Techniques de coupe sans chutes, alignement parfait des raccords et patrons sur mesure.",
    duration: "6 semaines",
    mode: "Atelier pratique",
    img: "/img/tissus.jpg",
    skillsAcquired: ["Patronage sur mesure", "Coupe wax", "Finitions haut de gamme"],
  },
  {
    id: "gestion-caisse-vente",
    cat: "Commerce & Vente",
    categoryKey: "commerce",
    title: "Caisse, Stocks & Vente Conseil",
    desc: "Tenue quotidienne du registre de caisse, inventaire des stocks et négociation fournisseur.",
    duration: "4 semaines",
    mode: "Format mixte",
    img: "/img/vendeuse.jpg",
    skillsAcquired: ["Tenue de caisse", "Gestion de stock", "Fidélisation client"],
  },
  {
    id: "cuir-maroquinerie",
    cat: "Artisanat",
    categoryKey: "artisanat",
    title: "Maroquinerie & Travail du Cuir",
    desc: "Découpe manuelle, parage, couture sellier et confection d'accessoires de maroquinerie.",
    duration: "8 semaines",
    mode: "Atelier",
    img: "/img/artisane.jpg",
    skillsAcquired: ["Couture sellier", "Parage du cuir", "Confection accessoires"],
  },
  {
    id: "whatsapp-business-artisanat",
    cat: "Digital & Tech",
    categoryKey: "tech",
    title: "Vente & Catalogue WhatsApp Business",
    desc: "Photos produits sous éclairage naturel, catalogue digital et automatisation des réponses.",
    duration: "3 semaines",
    mode: "Mobile en ligne",
    img: "/img/bureau.jpg",
    skillsAcquired: ["WhatsApp Business", "Photo produit mobile", "Service client digital"],
  },
  {
    id: "agro-conditionnement",
    cat: "Agroalimentaire",
    categoryKey: "agro",
    title: "Hygiène, Séchage & Conditionnement",
    desc: "Transformation de céréales et fruits locaux, normes d'hygiène et étiquetage attractif.",
    duration: "5 semaines",
    mode: "Coopérative",
    img: "/img/farine.jpg",
    skillsAcquired: ["Normes d'hygiène alimentaire", "Conditionnement", "Traçabilité"],
  },
  {
    id: "leadership-negociation",
    cat: "Gestion & Devis",
    categoryKey: "leadership",
    title: "Calcul des Coûts & Devis Professionnel",
    desc: "Calcul précis du coût de revient matière + main-d'œuvre et présentation de devis sereine.",
    duration: "4 semaines",
    mode: "Mentorat",
    img: "/img/cafe.jpg",
    skillsAcquired: ["Calcul de coût", "Établissement de devis", "Négociation client"],
  },
];

const CATEGORIES = [
  { key: "all", label: "Toutes les formations" },
  { key: "textile", label: "Confection & Mode" },
  { key: "commerce", label: "Commerce" },
  { key: "artisanat", label: "Artisanat" },
  { key: "tech", label: "Digital" },
  { key: "agro", label: "Agroalimentaire" },
  { key: "leadership", label: "Devis & Gestion" },
];

export default function FormationsPage() {
  const { session, profile, refreshProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [loadingEnroll, setLoadingEnroll] = useState<string | null>(null);

  // Charger les cours déjà suivis depuis le profil (ou localStorage de secours)
  useEffect(() => {
    if (profile?.interests && Array.isArray(profile.interests)) {
      setEnrolledIds(profile.interests);
    } else {
      const stored = localStorage.getItem("naya_enrolled_courses");
      if (stored) {
        try {
          setEnrolledIds(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, [profile]);

  const filteredCourses = useMemo(() => {
    if (selectedCategory === "all") return COURSES;
    return COURSES.filter((c) => c.categoryKey === selectedCategory);
  }, [selectedCategory]);

  async function handleEnroll(course: Course) {
    if (!session || !profile) {
      window.location.href = "/connexion?mode=inscription";
      return;
    }

    setLoadingEnroll(course.id);
    const isEnrolled = enrolledIds.includes(course.id);
    const updated = isEnrolled
      ? enrolledIds.filter((id) => id !== course.id)
      : [...enrolledIds, course.id];

    setEnrolledIds(updated);
    localStorage.setItem("naya_enrolled_courses", JSON.stringify(updated));

    try {
      // Sauvegarde dans les intérêts ou compétences du profil
      await supabase
        .from("profiles")
        .update({ interests: updated })
        .eq("id", profile.id);

      if (refreshProfile) await refreshProfile();
    } catch (err) {
      console.warn("[formations] Erreur mise à jour:", err);
    } finally {
      setLoadingEnroll(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />

      {/* HEADER ÉPURÉ */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 block mb-1">
              Compétences de terrain
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Formations Pratiques &amp; Certifiantes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Des parcours courts orientés action pour professionnaliser tes savoir-faire et booster tes revenus.
            </p>
          </div>

          {/* FILTRES RAPIDES */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  selectedCategory === cat.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GRILLE DES FORMATIONS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledIds.includes(course.id);
            const isProcessing = loadingEnroll === course.id;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                {/* PHOTO & BADGES */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <Image
                    src={course.img}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-900 shadow-2xs">
                    {course.cat}
                  </span>

                  {isEnrolled && (
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-xs">
                      ✓ Inscrite
                    </span>
                  )}
                </div>

                {/* DÉTAILS DU COURS */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 mb-1.5 leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {course.desc}
                    </p>

                    {/* COMPÉTENCES DÉLIVRÉES */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.skillsAcquired.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-[10px] font-medium text-slate-600"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" /> {course.duration}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPinIcon className="w-3.5 h-3.5 text-teal-600" /> {course.mode}
                      </span>
                    </div>

                    <button
                      onClick={() => handleEnroll(course)}
                      disabled={isProcessing}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all shadow-2xs ${
                        isEnrolled
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-slate-900 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {isProcessing
                        ? "En cours..."
                        : isEnrolled
                        ? "Abandonner"
                        : "Rejoindre"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
