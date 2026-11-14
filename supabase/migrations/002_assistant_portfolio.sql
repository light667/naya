-- NAYA — 002 : réparation des accents, assistante (historique), portfolio (médias + lien public)
-- À exécuter dans Supabase > SQL Editor, après 001_naya_init.sql. Ré-exécutable sans risque.

-- ============ 1. RÉPARATION DES TEXTES MAL ENCODÉS ============
-- Certaines données ont été insérées depuis une console Windows (page de code CP850) :
-- « événement » est devenu « ├®v├®nement », « — » est devenu « ÔÇö ».
-- Cette fonction relit chaque caractère CP850 comme l'octet d'origine puis redécode en UTF-8.
create or replace function public.naya_fix_cp850(t text)
returns text language plpgsql immutable as $$
declare
  cp850 constant text :=
    'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´' || chr(173) || '±‗¾¶§÷¸°¨·¹³²■' || chr(160);
  out bytea := ''::bytea;
  ch text;
  pos int;
begin
  if t is null or t !~ '[├┬Ô]' then return t; end if;
  for i in 1..char_length(t) loop
    ch := substr(t, i, 1);
    pos := strpos(cp850, ch);
    if pos > 0 then
      out := out || set_byte('\x00'::bytea, 0, 127 + pos);
    elsif ascii(ch) < 128 then
      out := out || convert_to(ch, 'UTF8');
    else
      return t; -- caractère inattendu : on ne touche à rien
    end if;
  end loop;
  return convert_from(out, 'UTF8');
exception when others then
  return t; -- séquence invalide : texte laissé tel quel
end $$;

update public.opportunities set
  title = public.naya_fix_cp850(title),
  description = public.naya_fix_cp850(description),
  organization = public.naya_fix_cp850(organization),
  category = public.naya_fix_cp850(category),
  location = public.naya_fix_cp850(location),
  pay = public.naya_fix_cp850(pay),
  contact = public.naya_fix_cp850(contact),
  skills = (select coalesce(array_agg(public.naya_fix_cp850(s)), '{}') from unnest(skills) s)
where (title || description || organization || category || coalesce(location, '') || coalesce(pay, '') || array_to_string(skills, ' ')) ~ '[├┬Ô]';

update public.profiles set
  full_name = public.naya_fix_cp850(full_name),
  headline = public.naya_fix_cp850(headline),
  city = public.naya_fix_cp850(city),
  bio = public.naya_fix_cp850(bio),
  experiences = public.naya_fix_cp850(experiences),
  availability = public.naya_fix_cp850(availability),
  skills = public.naya_fix_cp850(skills::text)::jsonb,
  suggestions = public.naya_fix_cp850(suggestions::text)::jsonb
where (full_name || coalesce(headline, '') || coalesce(city, '') || coalesce(bio, '') || coalesce(experiences, '') || skills::text || suggestions::text) ~ '[├┬Ô]';

-- ============ 2. PROFIL : champs complémentaires ============
alter table public.profiles add column if not exists education text default '';
alter table public.profiles add column if not exists certifications text default '';
alter table public.profiles add column if not exists avatar_url text default '';
alter table public.profiles add column if not exists portfolio_slug text;
alter table public.profiles add column if not exists portfolio_public boolean not null default false;
-- { "sections": [{"id":"presentation","visible":true}, ...], "intro": "texte de présentation du portfolio" }
alter table public.profiles add column if not exists portfolio_settings jsonb not null default '{}'::jsonb;
create unique index if not exists idx_profiles_portfolio_slug on public.profiles(portfolio_slug) where portfolio_slug is not null;

-- ============ 3. PORTFOLIO : projets enrichis + médias ============
alter table public.portfolio_items add column if not exists category text default '';
alter table public.portfolio_items add column if not exists goals text default '';
alter table public.portfolio_items add column if not exists role text default '';
alter table public.portfolio_items add column if not exists tools text[] not null default '{}';
alter table public.portfolio_items add column if not exists results text default '';
alter table public.portfolio_items add column if not exists position int not null default 0;
alter table public.portfolio_items add column if not exists updated_at timestamptz not null default now();

create table if not exists public.portfolio_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid references public.portfolio_items(id) on delete set null,
  path text not null,                 -- chemin dans le bucket « portfolio » : <user_id>/<fichier>
  kind text not null check (kind in ('image','video')),
  mime text default '',
  size_bytes bigint default 0,
  title text default '',
  caption text default '',
  description text default '',
  keywords text[] not null default '{}',
  category text default '',
  ai_status text not null default 'none' check (ai_status in ('none','proposed','accepted')),
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_portfolio_media_user on public.portfolio_media(user_id);
create index if not exists idx_portfolio_media_item on public.portfolio_media(item_id);
alter table public.portfolio_media enable row level security;
drop policy if exists "media: tout" on public.portfolio_media;
create policy "media: tout" on public.portfolio_media for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Stockage des fichiers : bucket public en lecture (nécessaire au lien partageable),
-- écriture limitée au dossier de l'utilisatrice. 50 Mo max par fichier.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 52428800,
        array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio: envoi" on storage.objects;
create policy "portfolio: envoi" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "portfolio: maj" on storage.objects;
create policy "portfolio: maj" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "portfolio: suppression" on storage.objects;
create policy "portfolio: suppression" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ============ 4. PORTFOLIO PUBLIC (lecture sans compte) ============
-- Renvoie le portfolio si son partage est activé, ou si c'est la propriétaire qui le consulte (aperçu).
create or replace function public.get_portfolio(p_slug text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'owner', p.id = auth.uid(),
    'is_public', p.portfolio_public,
    'profile', jsonb_build_object(
      'full_name', p.full_name, 'headline', p.headline, 'city', p.city, 'bio', p.bio,
      'experiences', p.experiences, 'education', p.education, 'certifications', p.certifications,
      'availability', p.availability, 'skills', p.skills, 'avatar_url', p.avatar_url,
      'settings', p.portfolio_settings, 'slug', p.portfolio_slug),
    'items', coalesce((select jsonb_agg(to_jsonb(i) - 'user_id' order by i.position, i.created_at desc)
                       from public.portfolio_items i where i.user_id = p.id), '[]'::jsonb),
    'media', coalesce((select jsonb_agg(to_jsonb(m) - 'user_id' order by m.position, m.created_at)
                       from public.portfolio_media m where m.user_id = p.id), '[]'::jsonb)
  )
  from public.profiles p
  where p.portfolio_slug = p_slug and (p.portfolio_public or p.id = auth.uid());
$$;
grant execute on function public.get_portfolio(text) to anon, authenticated;

-- ============ 5. HISTORIQUE DE L'ASSISTANTE ============
create table if not exists public.assistant_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('candidature','services','rendezvous')),
  title text not null default '',
  opportunity_id uuid references public.opportunities(id) on delete set null,
  params jsonb not null default '{}'::jsonb,     -- réglages utilisés (format, ton, langue, canal…)
  analysis jsonb,                                -- analyse de compatibilité au moment de la génération
  content text not null default '',
  checks jsonb,                                  -- vérification de cohérence
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_drafts_user on public.assistant_drafts(user_id, kind, updated_at desc);
alter table public.assistant_drafts enable row level security;
drop policy if exists "brouillon: tout" on public.assistant_drafts;
create policy "brouillon: tout" on public.assistant_drafts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
