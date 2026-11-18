"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MessageIcon, SupportIcon } from "@/components/PharIcons";
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
  const userName = profile?.full_name || "Talent PHAR";

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
      authorRole: profile?.headline || (profile?.role === "recruteur" ? "Entreprise" : "Talent"),
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

      {/* HEADER SIMPLE */}
      <section className="bg-gradient-to-b from-white to-[#EFFAFB] border-b border-[#E2ECF2] px-6 lg:px-12 py-8">
        <div className="max-w-[1100px] mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#22C3C9] block mb-1">
            Équipage PHAR
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A2A5C] mb-1">
            Entraide &amp; Échanges
          </h1>
          <p className="text-xs sm:text-sm text-[#536B88]">
            Partage tes astuces d&apos;atelier et échange avec les autres talents.
          </p>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 lg:px-12 py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
        
        {/* GROUPES */}
        <aside className="bg-white rounded-2xl p-4 border border-[#E2ECF2] shadow-xs space-y-1 text-xs font-bold">
          <div className="text-[11px] text-[#536B88] font-extrabold uppercase tracking-wider mb-2 px-2">
            Groupes
          </div>
          {[
            { key: "all", label: "Tous les échanges" },
            { key: "confection", label: "Confection & Mode" },
            { key: "marche", label: "Commerce & Vente" },
            { key: "cuir", label: "Artisanat du Cuir" },
            { key: "agro", label: "Agroalimentaire" },
          ].map((g) => (
            <button
              key={g.key}
              onClick={() => setSelectedGroup(g.key)}
              className={`w-full text-left px-3 py-2 rounded-xl transition-all ${
                selectedGroup === g.key
                  ? "bg-[#EFFAFB] text-[#129aa0]"
                  : "text-[#0A2A5C] hover:bg-[#EFFAFB]"
              }`}
            >
              {g.label}
            </button>
          ))}
        </aside>

        {/* FEED */}
        <div className="space-y-4">
          {/* COMPOSER */}
          <div className="bg-white rounded-2xl p-4 border border-[#E2ECF2] shadow-xs">
            {session ? (
              <form onSubmit={handleCreatePost} className="space-y-3">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pose une question ou partage un conseil..."
                  className="w-full bg-[#F8FCFD] border border-[#E2ECF2] rounded-xl px-3.5 py-2 text-xs text-[#0A2A5C] outline-none focus:border-[#22C3C9]"
                />
                <div className="flex items-center justify-between">
                  <select
                    value={postingCategory}
                    onChange={(e) => setPostingCategory(e.target.value)}
                    className="text-xs bg-[#EFFAFB] text-[#0A2A5C] font-bold px-2.5 py-1 rounded-lg border border-[#E2ECF2] outline-none"
                  >
                    <option value="Confection & Mode">Confection &amp; Mode</option>
                    <option value="Commerce & Vente">Commerce &amp; Vente</option>
                    <option value="Artisanat du Cuir">Artisanat du Cuir</option>
                    <option value="Agroalimentaire">Agroalimentaire</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className="bg-[#FFB81C] hover:bg-[#ffc138] disabled:opacity-50 text-[#0A2A5C] font-extrabold text-xs px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Publier
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-[#536B88]">Rejoins l&apos;Équipage pour participer.</span>
                <Link
                  href="/connexion?mode=inscription"
                  className="bg-[#0A2A5C] text-white font-extrabold px-3.5 py-1.5 rounded-lg"
                >
                  Participer
                </Link>
              </div>
            )}
          </div>

          {/* LISTE OU ÉTAT VIDE */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-[#E2ECF2] shadow-xs text-center">
              <MessageIcon className="w-8 h-8 text-[#22C3C9] mx-auto mb-2 opacity-60" />
              <h3 className="font-display font-extrabold text-sm text-[#0A2A5C] mb-1">
                Bienvenue dans l&apos;Équipage
              </h3>
              <p className="text-xs text-[#536B88]">
                Sois le premier à lancer une discussion d&apos;atelier !
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl p-4 border border-[#E2ECF2] shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0A2A5C] text-white font-bold text-xs flex items-center justify-center">
                      {post.authorName[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0A2A5C] block leading-none">
                        {post.authorName}
                      </span>
                      <span className="text-[10px] text-[#536B88]">{post.authorRole}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-[#EFFAFB] text-[#129aa0] px-2 py-0.5 rounded-md">
                    {post.category}
                  </span>
                </div>

                <p className="text-xs text-[#0A2A5C] leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E2ECF2] text-[11px] text-[#536B88]">
                  <span>{post.createdAt}</span>
                  <button
                    onClick={() => {
                      setPosts(
                        posts.map((p) =>
                          p.id === post.id ? { ...p, likes: p.likes + 1 } : p
                        )
                      );
                    }}
                    className="flex items-center gap-1 font-bold text-[#0A2A5C] hover:text-[#22C3C9]"
                  >
                    <SupportIcon className="w-3.5 h-3.5 text-[#22C3C9]" /> Soutenir ({post.likes})
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
