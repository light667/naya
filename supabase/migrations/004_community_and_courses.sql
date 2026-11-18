-- NAYA — 004 : Table de la communauté & suivi des formations
-- À exécuter dans Supabase > SQL Editor si vous souhaitez activer la table réseau native.

-- 1. Table des publications communautaires
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'Talent NAYA',
  author_role text not null default 'Membre',
  category text not null default 'Confection & Mode',
  content text not null,
  likes int not null default 0,
  created_at timestamptz not null default now()
);

-- Index pour tri rapide par date
create index if not exists idx_community_posts_date on public.community_posts(created_at desc);

-- RLS
alter table public.community_posts enable row level security;

-- Tout le monde (y compris non connectés) peut lire les publications
drop policy if exists "community: lecture publique" on public.community_posts;
create policy "community: lecture publique" on public.community_posts
  for select using (true);

-- Tout utilisateur connecté peut publier
drop policy if exists "community: insertion" on public.community_posts;
create policy "community: insertion" on public.community_posts
  for insert to authenticated
  with check (true);

-- Tout utilisateur peut incrémenter les likes
drop policy if exists "community: update likes" on public.community_posts;
create policy "community: update likes" on public.community_posts
  for update using (true);

-- 2. Suivi des formations dans les profils
alter table public.profiles add column if not exists enrolled_courses text[] not null default '{}';
