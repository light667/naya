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
  const userName = profile?.full_name || "Membre PHAR";
  const userRole = profile?.headline || (profile?.role === "recruteur" ? "Entreprise" : "");

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

  const SUGGESTIONS = [
    "Comment fixer le prix d'une tenue en wax ?",
    "Où acheter du tissu de bonne qualité à Lomé ?",
    "Comment trouver mes premiers clients sur WhatsApp ?",
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-[32px] font-semibold leading-[1.15] text-ink sm:text-4xl">Réseau</h1>
        <p className="mt-2 max-w-xl text-base text-muted">Pose tes questions et partage tes astuces d&apos;atelier.</p>

        <form onSubmit={handleCreatePost} className="mt-8 rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
          <label htmlFor="post" className="sr-only">Ton message</label>
          <textarea
            id="post"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ta question ou ton astuce"
            className="w-full resize-none rounded-xl border border-line bg-white p-4 text-base text-ink transition-colors placeholder:text-slate-400 focus:border-sun focus:outline-none"
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <select
              value={postingCategory}
              onChange={(e) => setPostingCategory(e.target.value)}
              aria-label="Catégorie"
              className="min-h-11 rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-sun"
            >
              <option value="Confection & Mode">Confection &amp; Mode</option>
              <option value="Commerce & Vente">Commerce &amp; Vente</option>
              <option value="Artisanat">Artisanat</option>
              <option value="Digital & Tech">Digital &amp; Tech</option>
            </select>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-sun px-6 text-sm font-semibold text-white transition-colors hover:bg-sun-700 disabled:opacity-40"
            >
              Publier
            </button>
          </div>
        </form>

        <div className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Catégories">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setSelectedGroup(g.key)}
              aria-pressed={selectedGroup === g.key}
              className={`min-h-10 shrink-0 rounded-lg px-4 text-sm transition-colors ${
                selectedGroup === g.key ? "bg-ink font-medium text-white" : "bg-white text-slate-700 ring-1 ring-inset ring-line hover:bg-slate-50"
              }`}
            >
              {g.key === "all" ? "Tout" : g.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loadingPosts ? (
            <p className="py-12 text-center text-sm text-muted">Chargement…</p>
          ) : filteredPosts.length === 0 ? (
            <div className="py-6">
              <p className="text-sm text-muted">Pas encore de message ici. Tu peux commencer par une de ces questions :</p>
              <ul className="mt-3 space-y-2">
                {SUGGESTIONS.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => setContent(q)}
                      className="flex min-h-12 w-full items-center rounded-xl bg-white px-4 text-left text-sm text-ink ring-1 ring-line transition-colors hover:bg-slate-50"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
              {filteredPosts.map((post) => (
                <li key={post.id}>
                  <article className="p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-ink" aria-hidden>
                        {post.authorName.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{post.authorName}</p>
                        <p className="truncate text-xs text-muted">
                          {[post.authorRole, post.category, post.createdAt].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-base text-slate-700">{post.content}</p>
                    <button
                      onClick={() => handleLike(post.id)}
                      aria-pressed={post.userLiked}
                      className={`mt-3 inline-flex min-h-11 items-center gap-2 text-sm transition-colors ${post.userLiked ? "font-medium text-sun" : "text-muted hover:text-ink"}`}
                    >
                      Utile
                      <span className="tabular-nums">{post.likes}</span>
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-12 text-xs text-muted">Règle du réseau : respect, entraide, et jamais de demande d&apos;argent.</p>
      </main>

      <Footer />
    </div>
  );
}
