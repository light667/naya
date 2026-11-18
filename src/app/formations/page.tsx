"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClockIcon, StarIcon, MapPinIcon } from "@/components/PharIcons";

const COURSES = [
  {
    id: "patronage-wax",
    cat: "Confection",
    categoryKey: "textile",
    title: "Patronage & Coupe Wax",
    desc: "Techniques de coupe précise sans chutes et alignement des motifs.",
    duration: "6 sem.",
    mode: "Atelier",
    img: "/img/tissus.jpg",
  },
  {
    id: "gestion-caisse-vente",
    cat: "Commerce",
    categoryKey: "commerce",
    title: "Caisse, Stocks & Vente",
    desc: "Négociation fournisseurs et gestion quotidienne du registre de caisse.",
    duration: "4 sem.",
    mode: "Mobile",
    img: "/img/vendeuse.jpg",
  },
  {
    id: "cuir-maroquinerie",
    cat: "Artisanat",
    categoryKey: "artisanat",
    title: "Maroquinerie & Cuir Local",
    desc: "Découpe manuelle, parage et couture sellier pour accessoires.",
    duration: "8 sem.",
    mode: "Atelier",
    img: "/img/artisane.jpg",
  },
  {
    id: "whatsapp-business-artisanat",
    cat: "Digital",
    categoryKey: "tech",
    title: "Vente par WhatsApp Business",
    desc: "Photos produits au smartphone et catalogue digital professionnel.",
    duration: "3 sem.",
    mode: "Mobile",
    img: "/img/bureau.jpg",
  },
  {
    id: "agro-conditionnement",
    cat: "Agroalimentaire",
    categoryKey: "agro",
    title: "Hygiène & Conditionnement",
    desc: "Transformation de céréales locales et étiquetage attractif.",
    duration: "5 sem.",
    mode: "Coopérative",
    img: "/img/farine.jpg",
  },
  {
    id: "leadership-negociation",
    cat: "Leadership",
    categoryKey: "leadership",
    title: "Pitch de Projet & Devis",
    desc: "Présentation claire de tes savoir-faire et négociation client.",
    duration: "4 sem.",
    mode: "Mentorat",
    img: "/img/cafe.jpg",
  },
];

export default function FormationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    if (selectedCategory === "all") return COURSES;
    return COURSES.filter((c) => c.categoryKey === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C]">
      <Navbar />

      {/* HEADER SIMPLE */}
      <section className="bg-gradient-to-b from-white to-[#EFFAFB] border-b border-[#E2ECF2] px-6 lg:px-12 py-8">
        <div className="max-w-[1320px] mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#22C3C9] block mb-1">
            Cap Formation
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2A5C] mb-2">
            Formations Certifiantes
          </h1>
          <p className="text-xs sm:text-sm text-[#536B88] mb-6">
            Parcours pratiques de terrain pour développer tes compétences.
          </p>

          {/* FILTRES RAPIDES */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Toutes" },
              { key: "textile", label: "Confection" },
              { key: "commerce", label: "Commerce" },
              { key: "artisanat", label: "Artisanat" },
              { key: "tech", label: "Digital" },
              { key: "agro", label: "Agroalimentaire" },
              { key: "leadership", label: "Leadership" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedCategory(f.key)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                  selectedCategory === f.key
                    ? "bg-[#0A2A5C] text-white shadow-xs"
                    : "bg-white text-[#536B88] border border-[#E2ECF2] hover:border-[#22C3C9]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOGUE */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#E2ECF2] shadow-xs hover:border-[#22C3C9] transition-all flex flex-col justify-between"
            >
              <div className="relative h-40">
                <Image src={course.img} alt={course.title} fill className="object-cover" />
                <span className="absolute top-2.5 left-2.5 bg-white/95 px-2 py-0.5 rounded-md text-[10px] font-extrabold text-[#0A2A5C]">
                  {course.cat}
                </span>
                <span className="absolute top-2.5 right-2.5 bg-[#FFB81C] text-[#0A2A5C] px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1">
                  <StarIcon className="w-3 h-3 text-[#0A2A5C]" /> Certifié
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-base text-[#0A2A5C] mb-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#536B88] line-clamp-2 mb-3">
                    {course.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2ECF2] flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-[#536B88]">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5 text-[#22C3C9]" /> {course.mode}
                    </span>
                  </span>
                  <Link
                    href="/connexion?mode=inscription"
                    className="bg-[#EFFAFB] hover:bg-[#FFB81C] text-[#0A2A5C] font-extrabold text-xs px-3 py-1.5 rounded-lg transition-colors"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
