"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClockIcon, StarIcon, MapPinIcon, CompassIcon } from "@/components/PharIcons";
import { useAuth } from "@/components/AuthProvider";

const PHAR_COURSES = [
  {
    id: "patronage-wax",
    cat: "Confection & Textile",
    categoryKey: "textile",
    title: "Techniques Avancées du Patronage & Coupe Wax",
    desc: "Apprenez à concevoir des patrons sur mesure, à optimiser la disposition des motifs wax sans chutes superflues et à réaliser des finitions soignées.",
    duration: "6 semaines",
    mode: "Atelier & Pratique",
    level: "Pratique",
    img: "/img/tissus.jpg",
  },
  {
    id: "gestion-caisse-vente",
    cat: "Commerce & Vente",
    categoryKey: "commerce",
    title: "Gestion de Caisse, Stocks & Vente Directe",
    desc: "De la négociation d'approvisionnement avec les grossistes jusqu'à la tenue quotidienne d'un cahier de caisse et la fidélisation des acheteurs sur marché.",
    duration: "4 semaines",
    mode: "Format Mobile",
    level: "Essentiel",
    img: "/img/vendeuse.jpg",
  },
  {
    id: "cuir-maroquinerie",
    cat: "Artisanat d'Art",
    categoryKey: "artisanat",
    title: "Travail du Cuir Local & Maroquinerie Durable",
    desc: "Techniques traditionnelles et modernes de découpe, parage, couture sellier à la main et patines naturelles pour sacs et ceintures haut de gamme.",
    duration: "8 semaines",
    mode: "Atelier Maître",
    level: "Atelier",
    img: "/img/artisane.jpg",
  },
  {
    id: "whatsapp-business-artisanat",
    cat: "Numérique & Tech",
    categoryKey: "tech",
    title: "Visibilité Digitale & Vente par WhatsApp Business",
    desc: "Mettre en valeur vos créations artisanales avec votre smartphone, configurer votre catalogue produit et conclure des ventes en ligne en toute sécurité.",
    duration: "3 semaines",
    mode: "Mobile & Audio",
    level: "Pratique",
    img: "/img/bureau.jpg",
  },
  {
    id: "agro-conditionnement",
    cat: "Agro-transformation",
    categoryKey: "agro",
    title: "Normes d'Hygiène, Séchage & Conditionnement Local",
    desc: "Transformation et valorisation des produits du terroir, techniques de conservation sans additifs chimiques et étiquetage attractif pour la distribution.",
    duration: "5 semaines",
    mode: "Coopérative",
    level: "Certifié",
    img: "/img/farine.jpg",
  },
  {
    id: "leadership-negociation",
    cat: "Leadership & Projet",
    categoryKey: "leadership",
    title: "Pitcher son Projet d'Atelier & Négocier un Financement",
    desc: "Présenter avec clarté et conviction votre savoir-faire, structurer votre devis et négocier avec des partenaires économiques ou des micro-crédits.",
    duration: "4 semaines",
    mode: "Mentorat 1:1",
    level: "Accompagné",
    img: "/img/cafe.jpg",
  },
];

export default function FormationsPage() {
  const { session } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    if (selectedCategory === "all") return PHAR_COURSES;
    return PHAR_COURSES.filter((c) => c.categoryKey === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C]">
      <Navbar />

      {/* BANNIÈRE HERO CAP FORMATION */}
      <section className="bg-gradient-to-b from-white to-[#EFFAFB] border-b border-[#E2ECF2] px-6 lg:px-12 py-12">
        <div className="max-w-[1320px] mx-auto">
          <span className="inline-block bg-[#FFB81C]/20 text-[#0A2A5C] text-xs font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full mb-3">
            Cap Formation
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-[#0A2A5C] font-extrabold mb-3">
            DÉVELOPPER TES COMPÉTENCES DE TERRAIN
          </h1>
          <p className="text-[#536B88] text-base sm:text-lg max-w-2xl mb-8">
            Des parcours concrets et certifiés, co-construits avec des maîtres artisans, directeurs d&apos;ateliers et partenaires pour booster ton employabilité.
          </p>

          {/* APPEL À L'ACTION SELON L'ÉTAT DE L'UTILISATEUR */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2ECF2] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#22C3C9]/15 text-[#22C3C9] flex items-center justify-center shrink-0">
                <CompassIcon className="w-6 h-6 text-[#22C3C9]" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-base text-[#0A2A5C]">
                  {session ? "Accède à ton suivi de formation" : "Formations accessibles sans barrière de diplôme"}
                </h2>
                <p className="text-xs text-[#536B88]">
                  {session
                    ? "Retrouve tes modules en cours et tes certificats validés dans ton espace personnel."
                    : "Chaque parcours est pensé pour valoriser la pratique, l'apprentissage par le geste et le mentorat."}
                </p>
              </div>
            </div>

            <Link
              href={session ? "/app" : "/connexion?mode=inscription"}
              className="bg-[#0A2A5C] hover:bg-[#0d3470] text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              {session ? "Mon tableau de bord →" : "S'inscrire à une formation →"}
            </Link>
          </div>

          {/* FILTRES CATÉGORIES ACTIFS */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                selectedCategory === "all"
                  ? "bg-[#0A2A5C] text-white shadow-sm"
                  : "bg-white hover:bg-[#EFFAFB] text-[#0A2A5C] border border-[#E2ECF2]"
              }`}
            >
              Toutes les formations
            </button>
            <button
              onClick={() => setSelectedCategory("textile")}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                selectedCategory === "textile"
                  ? "bg-[#0A2A5C] text-white shadow-sm"
                  : "bg-white hover:bg-[#EFFAFB] text-[#0A2A5C] border border-[#E2ECF2]"
              }`}
            >
              Confection &amp; Textile
            </button>
            <button
              onClick={() => setSelectedCategory("commerce")}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                selectedCategory === "commerce"
                  ? "bg-[#0A2A5C] text-white shadow-sm"
                  : "bg-white hover:bg-[#EFFAFB] text-[#0A2A5C] border border-[#E2ECF2]"
              }`}
            >
              Commerce &amp; Vente
            </button>
            <button
              onClick={() => setSelectedCategory("artisanat")}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                selectedCategory === "artisanat"
                  ? "bg-[#0A2A5C] text-white shadow-sm"
                  : "bg-white hover:bg-[#EFFAFB] text-[#0A2A5C] border border-[#E2ECF2]"
              }`}
            >
              Artisanat &amp; Cuir
            </button>
            <button
              onClick={() => setSelectedCategory("agro")}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                selectedCategory === "agro"
                  ? "bg-[#0A2A5C] text-white shadow-sm"
                  : "bg-white hover:bg-[#EFFAFB] text-[#0A2A5C] border border-[#E2ECF2]"
              }`}
            >
              Agro-transformation
            </button>
            <button
              onClick={() => setSelectedCategory("tech")}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                selectedCategory === "tech"
                  ? "bg-[#0A2A5C] text-white shadow-sm"
                  : "bg-white hover:bg-[#EFFAFB] text-[#0A2A5C] border border-[#E2ECF2]"
              }`}
            >
              Numérique &amp; WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* CATALOGUE DE FORMATIONS */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#E2ECF2] shadow-sm hover:border-[#22C3C9] hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-44">
                <Image src={course.img} alt={course.title} fill className="object-cover" />
                <span className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase text-[#0A2A5C]">
                  {course.level}
                </span>
                <span className="absolute top-3 right-3 bg-[#FFB81C] text-[#0A2A5C] px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-sm flex items-center gap-1">
                  <StarIcon className="w-3 h-3 text-[#0A2A5C]" /> Certifiante PHAR
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#129aa0] block mb-1">{course.cat}</span>
                  <h3 className="font-display font-extrabold text-base text-[#0A2A5C] mb-2 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#536B88] line-clamp-3 mb-4 leading-relaxed">
                    {course.desc}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#0A2A5C] pt-3 border-t border-[#E2ECF2] mb-4">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5 text-[#536B88]" /> {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5 text-[#22C3C9]" /> {course.mode}
                    </span>
                  </div>
                  <Link
                    href={session ? "/app" : "/connexion?mode=inscription"}
                    className="block w-full text-center bg-[#EFFAFB] hover:bg-[#FFB81C] text-[#0A2A5C] font-extrabold text-xs py-2.5 rounded-xl transition-colors"
                  >
                    {session ? "Accéder à la formation" : "Rejoindre la promotion"}
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
