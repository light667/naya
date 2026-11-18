"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ScissorsIcon,
  BagIcon,
  LeatherIcon,
  SproutIcon,
  MobileIcon,
  SupportIcon,
  MessageIcon,
  CompassIcon,
} from "@/components/PharIcons";
import { useAuth } from "@/components/AuthProvider";

type Post = {
  id: string;
  authorName: string;
  authorRole: string;
  category: string;
  content: string;
  createdAt: string;
  likes: number;
};

export default function CommunautePage() {
  const { session, profile } = useAuth();
  const userName = profile?.full_name || "Jeune Talent";

  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [postingCategory, setPostingCategory] = useState("Confection & Mode");

  function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      authorName: userName,
      authorRole: profile?.headline || (profile?.role === "recruteur" ? "Entreprise Partenaire" : "Talent PHAR"),
      category: postingCategory,
      content: content.trim(),
      createdAt: "À l'instant",
      likes: 1,
    };

    setPosts([newPost, ...posts]);
    setContent("");
  }

  const filteredPosts = posts.filter((p) => {
    if (selectedGroup === "all") return true;
    return p.category.toLowerCase().includes(selectedGroup.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8FCFD] flex flex-col text-[#0A2A5C]">
      <Navbar />

      {/* BANNIÈRE EN-TÊTE ÉQUIPAGE */}
      <section className="bg-gradient-to-b from-white to-[#EFFAFB] border-b border-[#E2ECF2] px-6 lg:px-12 py-12">
        <div className="max-w-[1320px] mx-auto">
          <span className="inline-block bg-[#22C3C9]/15 text-[#129aa0] text-xs font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full mb-3">
            Équipage PHAR
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-[#0A2A5C] font-extrabold mb-3">
            L&apos;ÉQUIPAGE : S&apos;ENTRAIDER, APPRENDRE &amp; S&apos;ÉLEVER ENSEMBLE
          </h1>
          <p className="text-[#536B88] text-base sm:text-lg max-w-2xl">
            Un espace d&apos;échange bienveillant où talents émergents, maîtres artisans et mentors partagent conseils pratiques, retours d&apos;expérience et opportunités d&apos;entraide.
          </p>
        </div>
      </section>

      {/* GRILLE EN 3 COLONNES */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[260px_1fr_320px] gap-8 items-start">
        
        {/* COLONNE GAUCHE : GROUPES MÉTIERS */}
        <aside className="bg-white rounded-2xl p-5 border border-[#E2ECF2] shadow-sm space-y-3">
          <h2 className="font-display font-extrabold text-sm text-[#0A2A5C] mb-3">
            Groupes Métiers
          </h2>

          <div className="space-y-1 text-xs font-bold">
            <button
              onClick={() => setSelectedGroup("all")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                selectedGroup === "all"
                  ? "bg-[#EFFAFB] text-[#129aa0]"
                  : "text-[#0A2A5C] hover:bg-[#EFFAFB]"
              }`}
            >
              <CompassIcon className="w-4 h-4 text-[#22C3C9]" /> Tous les échanges
            </button>
            <button
              onClick={() => setSelectedGroup("confection")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                selectedGroup === "confection"
                  ? "bg-[#EFFAFB] text-[#129aa0]"
                  : "text-[#0A2A5C] hover:bg-[#EFFAFB]"
              }`}
            >
              <ScissorsIcon className="w-4 h-4 text-[#22C3C9]" /> Confection &amp; Mode Wax
            </button>
            <button
              onClick={() => setSelectedGroup("marche")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                selectedGroup === "marche"
                  ? "bg-[#EFFAFB] text-[#129aa0]"
                  : "text-[#0A2A5C] hover:bg-[#EFFAFB]"
              }`}
            >
              <BagIcon className="w-4 h-4 text-[#0A2A5C]" /> Marchés &amp; Vente Directe
            </button>
            <button
              onClick={() => setSelectedGroup("cuir")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                selectedGroup === "cuir"
                  ? "bg-[#EFFAFB] text-[#129aa0]"
                  : "text-[#0A2A5C] hover:bg-[#EFFAFB]"
              }`}
            >
              <LeatherIcon className="w-4 h-4 text-[#0A2A5C]" /> Artisanat du Cuir
            </button>
            <button
              onClick={() => setSelectedGroup("agro")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                selectedGroup === "agro"
                  ? "bg-[#EFFAFB] text-[#129aa0]"
                  : "text-[#0A2A5C] hover:bg-[#EFFAFB]"
              }`}
            >
              <SproutIcon className="w-4 h-4 text-[#0A2A5C]" /> Agro-transformation
            </button>
            <button
              onClick={() => setSelectedGroup("entrepreneures")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
                selectedGroup === "entrepreneures"
                  ? "bg-[#EFFAFB] text-[#129aa0]"
                  : "text-[#0A2A5C] hover:bg-[#EFFAFB]"
              }`}
            >
              <MobileIcon className="w-4 h-4 text-[#0A2A5C]" /> Jeunes Entrepreneures
            </button>
          </div>
        </aside>

        {/* COLONNE CENTRALE : COMPOSER ET FIL */}
        <div className="space-y-6">
          
          {/* COMPOSER RÉEL */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2ECF2] shadow-sm">
            {session ? (
              <form onSubmit={handleCreatePost}>
                <div className="flex gap-3.5 items-center mb-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#0A2A5C] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    {userName ? userName[0].toUpperCase() : "U"}
                  </div>
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Partage une astuce d'atelier, pose une question ou propose un échange..."
                    className="flex-1 bg-[#F8FCFD] border border-[#E2ECF2] rounded-full px-4 py-2.5 text-xs text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2ECF2]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#536B88]">Groupe :</span>
                    <select
                      value={postingCategory}
                      onChange={(e) => setPostingCategory(e.target.value)}
                      className="text-xs bg-[#EFFAFB] text-[#0A2A5C] font-bold px-3 py-1.5 rounded-lg border border-[#E2ECF2] outline-none"
                    >
                      <option value="Confection & Mode">Confection &amp; Mode</option>
                      <option value="Marchés & Vente">Marchés &amp; Vente</option>
                      <option value="Artisanat du Cuir">Artisanat du Cuir</option>
                      <option value="Agro-transformation">Agro-transformation</option>
                      <option value="Jeunes Entrepreneures">Jeunes Entrepreneures</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="bg-[#FFB81C] hover:bg-[#ffc138] disabled:opacity-50 text-[#0A2A5C] font-extrabold text-xs px-5 py-2 rounded-xl transition-colors shadow-2xs"
                  >
                    Publier dans l&apos;Équipage
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFFAFB] text-[#22C3C9] flex items-center justify-center shrink-0">
                    <MessageIcon className="w-5 h-5 text-[#22C3C9]" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-[#0A2A5C]">
                      Rejoins l&apos;Équipage pour échanger
                    </h3>
                    <p className="text-xs text-[#536B88]">
                      Connecte-toi pour publier des astuces ou solliciter l&apos;avis des mentors.
                    </p>
                  </div>
                </div>
                <Link
                  href="/connexion?mode=inscription"
                  className="bg-[#0A2A5C] hover:bg-[#0d3470] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  Participer à la discussion
                </Link>
              </div>
            )}
          </div>

          {/* LISTE DES PUBLICATIONS OU ÉTAT DE LANCEMENT */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-[#E2ECF2] shadow-sm text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFFAFB] text-[#22C3C9] mx-auto flex items-center justify-center mb-4">
                <MessageIcon className="w-7 h-7 text-[#22C3C9]" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-[#0A2A5C] mb-2">
                Bienvenue dans l&apos;Équipage PHAR !
              </h3>
              <p className="text-xs sm:text-sm text-[#536B88] max-w-md mx-auto mb-6 leading-relaxed">
                L&apos;espace communautaire ouvre ses portes. C&apos;est le moment de poser ta première question technique, de partager une bonne pratique d&apos;atelier ou de saluer les autres membres de ta promotion.
              </p>
              {session ? (
                <p className="text-xs font-bold text-[#129aa0]">
                  Utilise le champ ci-dessus pour lancer la première discussion !
                </p>
              ) : (
                <Link
                  href="/connexion?mode=inscription"
                  className="inline-block bg-[#FFB81C] hover:bg-[#ffc138] text-[#0A2A5C] font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Créer un compte pour participer
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl p-6 border border-[#E2ECF2] shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0A2A5C] text-white font-extrabold text-xs flex items-center justify-center">
                        {post.authorName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-display font-extrabold text-sm text-[#0A2A5C]">
                          {post.authorName}
                        </h4>
                        <p className="text-[11px] text-[#536B88]">{post.authorRole}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-[#EFFAFB] text-[#129aa0] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>

                  <p className="text-sm text-[#0A2A5C] leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E2ECF2] text-xs text-[#536B88]">
                    <span>{post.createdAt}</span>
                    <button
                      onClick={() => {
                        setPosts(
                          posts.map((p) =>
                            p.id === post.id ? { ...p, likes: p.likes + 1 } : p
                          )
                        );
                      }}
                      className="flex items-center gap-1.5 font-bold text-[#0A2A5C] hover:text-[#22C3C9] transition-colors"
                    >
                      <SupportIcon className="w-4 h-4 text-[#22C3C9]" /> Soutenir ({post.likes})
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>

        {/* COLONNE DROITE : CHARTE ET MENTORS */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-[#E2ECF2] shadow-sm">
            <span className="text-[10px] font-extrabold text-[#129aa0] uppercase tracking-wider block mb-2">
              Charte de Bienveillance
            </span>
            <h3 className="font-display font-extrabold text-sm text-[#0A2A5C] mb-2">
              L&apos;Esprit de l&apos;Équipage PHAR
            </h3>
            <p className="text-xs text-[#536B88] leading-relaxed mb-4">
              Ici, chaque question est légitime et chaque expérience partagée éclaire le chemin d&apos;un autre talent. Respect, encouragement mutuel et solidarité sont nos valeurs cardinales.
            </p>
            <div className="bg-[#EFFAFB] p-3 rounded-xl text-xs text-[#0A2A5C] font-bold">
              Tous les métiers et savoir-faire méritent le respect.
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E2ECF2] shadow-sm">
            <span className="text-[10px] font-extrabold text-[#129aa0] uppercase tracking-wider block mb-2">
              Mentorat &amp; Accompagnement
            </span>
            <h3 className="font-display font-extrabold text-sm text-[#0A2A5C] mb-2">
              Besoin d&apos;un conseil expert ?
            </h3>
            <p className="text-xs text-[#536B88] leading-relaxed mb-4">
              Nos maîtres artisans et recruteurs partenaires animent régulièrement des sessions d&apos;écoute et de retour d&apos;expérience.
            </p>
            <Link
              href="/formations"
              className="block text-center bg-[#FFB81C] hover:bg-[#ffc138] text-[#0A2A5C] font-extrabold text-xs py-2.5 rounded-xl transition-colors"
            >
              Découvrir les parcours accompagnés
            </Link>
          </div>
        </aside>

      </main>

      <Footer />
    </div>
  );
}
