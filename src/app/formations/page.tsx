"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
      const stored = localStorage.getItem("phar_enrolled_courses") ?? localStorage.getItem("naya_enrolled_courses");
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
    localStorage.setItem("phar_enrolled_courses", JSON.stringify(updated));

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
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-[32px] font-semibold leading-[1.15] text-ink sm:text-4xl">Formations pratiques</h1>
        <p className="mt-2 max-w-xl text-base text-muted">Des formations courtes, en atelier, pour mieux travailler et mieux vendre.</p>

        <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Catégories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              aria-pressed={selectedCategory === cat.key}
              className={`min-h-10 shrink-0 rounded-lg px-4 text-sm transition-colors ${
                selectedCategory === cat.key ? "bg-ink font-medium text-white" : "bg-white text-slate-700 ring-1 ring-inset ring-line hover:bg-slate-50"
              }`}
            >
              {cat.key === "all" ? "Toutes" : cat.label}
            </button>
          ))}
        </div>

        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledIds.includes(course.id);
            const isProcessing = loadingEnroll === course.id;
            return (
              <li key={course.id} className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line">
                <div className="relative h-40 bg-slate-100">
                  <Image src={course.img} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted">
                    <span>{course.cat}</span>
                    {isEnrolled && <span className="text-sage">Inscrit</span>}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold leading-snug text-ink">{course.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{course.desc}</p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <p className="text-xs text-muted">
                      {course.duration} · {course.mode}
                    </p>
                    <button
                      onClick={() => handleEnroll(course)}
                      disabled={isProcessing}
                      className={`inline-flex min-h-11 shrink-0 items-center px-1 text-sm font-semibold transition-colors disabled:opacity-50 ${
                        isEnrolled ? "text-muted hover:text-ink" : "text-sun hover:text-sun-700"
                      }`}
                    >
                      {isProcessing ? "Un instant…" : isEnrolled ? "Me désinscrire" : "M'inscrire"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>

      <Footer />
    </div>
  );
}
