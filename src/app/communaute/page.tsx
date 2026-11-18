"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

type Post = {
  id: string;
  authorName: string;
  authorRole: string;
  category: string;
  content: string;
  createdAt: string;
  likes: number;
  userLiked?: boolean;
};

const GROUPS = [
  { key: "all", label: "Tous les échanges" },
  { key: "confection", label: "Confection & Mode" },
  { key: "commerce", label: "Commerce & Vente" },
  { key: "artisanat", label: "Artisanat" },
  { key: "digital", label: "Digital & Tech" },
];

export default function CommunautePage() {
  const { session, profile } = useAuth();
  const userName = profile?.full_name || "Talent NAYA";
  const userRole = profile?.headline || (profile?.role === "recruteur" ? "Entreprise Partenaire" : "Talent émergent");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [content, setContent] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [postingCategory, setPostingCategory] = useState("Confection & Mode");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadPosts() {
      try {
        const { data, error } = await supabase
          .from("community_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const loaded: Post[] = data.map((d: { id: string; author_name: string; author_role: string; category: string; content: string; created_at: string; likes: number }) => ({
            id: d.id,
            authorName: d.author_name,
            authorRole: d.author_role,
            category: d.category,
            content: d.content,
            createdAt: new Date(d.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
            likes: d.likes || 0,
          }));
          setPosts(loaded);
        }
      } catch (err) {
        console.warn("[communaute] erreur chargement posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    }
    loadPosts();
  }, []);

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const newPost: Post = {
      id: Date.now().toString(),
      authorName: userName,
      authorRole: userRole,
      category: postingCategory,
      content: content.trim(),
      createdAt: "À l'instant",
      likes: 1,
    };

    setPosts([newPost, ...posts]);
    setContent("");

    try {
      await supabase.from("community_posts").insert({
        user_id: session?.user?.id || null,
        author_name: userName,
        author_role: userRole,
        category: postingCategory,
        content: newPost.content,
        likes: 1,
      });
    } catch (err) {
      console.warn("[communaute] insert error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLike(postId: string) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newLikes = p.userLiked ? p.likes - 1 : p.likes + 1;
          return { ...p, likes: newLikes, userLiked: !p.userLiked };
        }
        return p;
      })
    );
  }

  const filteredPosts = posts.filter((p) => {
    if (selectedGroup === "all") return true;
    return p.category.toLowerCase().includes(selectedGroup.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />

      {/* EN-TÊTE ÉPURÉ */}
      <section className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 block mb-1">
              Réseau &amp; Entraide
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Communauté des Talents
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Partage tes retours d&apos;expérience, pose tes questions métier et échange avec tes pairs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {posts.length} publication{posts.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-start">
        
        {/* SIDEBAR GROUPES */}
        <aside className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
            Canaux métiers
          </div>
          {GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setSelectedGroup(g.key)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedGroup === g.key
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {g.label}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-slate-100 px-3">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Charte de la communauté : respect mutuel, partage de bonnes pratiques de terrain et solidarité professionnelle.
            </p>
          </div>
        </aside>

        {/* FEED PRINCIPAL */}
        <div className="space-y-6">
          
          {/* COMPOSITEUR DE POST */}
          <form
            onSubmit={handleCreatePost}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-900">
                Partager une astuce ou poser une question
              </span>
              <select
                value={postingCategory}
                onChange={(e) => setPostingCategory(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-slate-900 font-medium"
              >
                <option value="Confection & Mode">Confection &amp; Mode</option>
                <option value="Commerce & Vente">Commerce &amp; Vente</option>
                <option value="Artisanat">Artisanat</option>
                <option value="Digital & Tech">Digital &amp; Tech</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écris ton message ici (astuce d'atelier, question sur un fournisseur, retour d'expérience...)"
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:outline-none transition-all placeholder:text-slate-400 resize-none"
            />

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                Publié en tant que <strong className="text-slate-700 font-semibold">{userName}</strong>
              </span>
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-40"
              >
                Publier
              </button>
            </div>
          </form>

          {/* LISTE DES PUBLICATIONS */}
          <div className="space-y-4">
            {loadingPosts ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 text-slate-500 text-xs">
                Chargement des échanges...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 text-slate-500 text-xs leading-relaxed">
                Aucune publication pour le moment dans ce canal. Sois la première personne à partager une expérience ou poser une question !
              </div>
            ) : (
              filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                        {post.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {post.authorName}
                        </div>
                        <div className="text-[11px] text-slate-500">{post.authorRole}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{post.createdAt}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                        post.userLiked
                          ? "bg-rose-50 border-rose-200 text-rose-600 font-semibold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 ${post.userLiked ? "fill-rose-600 text-rose-600" : "fill-none text-slate-500"}`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{post.likes}</span>
                    </button>

                    <span className="text-[11px] text-slate-400">Échange vérifié PHAR</span>
                  </div>
                </article>
              ))
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
