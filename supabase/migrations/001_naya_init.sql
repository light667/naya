-- PHAR — schéma initial
-- À exécuter dans Supabase > SQL Editor (projet kdpkxlyyxahuviohyjuu).

-- ============ PROFILS ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  headline text default '',
  city text default '',
  bio text default '',
  experiences text default '',
  interests text[] not null default '{}',
  availability text default '',
  skills jsonb not null default '[]'::jsonb,       -- [{name, category, level}]
  suggestions jsonb not null default '[]'::jsonb,  -- activités rémunératrices suggérées
  role text not null default 'talent' check (role in ('talent','recruteur','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Empêche une utilisatrice de s'auto-promouvoir admin
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and new.role = 'admin'
     and auth.uid() is not null and not public.is_admin() then
    raise exception 'Changement de rôle non autorisé';
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role before update on public.profiles
for each row execute function public.protect_profile_role();

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when new.raw_user_meta_data->>'role' = 'recruteur' then 'recruteur' else 'talent' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ OPPORTUNITÉS ============
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  description text not null default '',
  organization text not null,
  org_type text not null default 'entreprise' check (org_type in ('entreprise','association','particulier')),
  category text not null default 'Autre',
  skills text[] not null default '{}',
  location text default '',
  remote boolean not null default false,
  pay text default '',
  contact text default '',
  status text not null default 'en_attente' check (status in ('en_attente','verifiee','rejetee')),
  created_at timestamptz not null default now()
);

-- ============ CANDIDATURES ============
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  status text not null default 'a_postuler' check (status in ('a_postuler','envoyee','entretien','acceptee','refusee')),
  message text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

-- ============ PORTFOLIO ============
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text default '',
  link text default '',
  created_at timestamptz not null default now()
);

-- ============ SIGNALEMENTS ============
create table if not exists public.opportunity_reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  unique (opportunity_id, user_id)
);

create index if not exists idx_applications_user on public.applications(user_id);
create index if not exists idx_applications_opp on public.applications(opportunity_id);
create index if not exists idx_portfolio_user on public.portfolio_items(user_id);
create index if not exists idx_opportunities_status on public.opportunities(status);
create index if not exists idx_opportunities_created_by on public.opportunities(created_by);
create index if not exists idx_reports_opp on public.opportunity_reports(opportunity_id);

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.opportunity_reports enable row level security;

-- Profils : chacune voit/modifie le sien ; un recruteur voit le profil des candidates à ses offres
drop policy if exists "profil: lecture" on public.profiles;
create policy "profil: lecture" on public.profiles for select to authenticated using (
  id = (select auth.uid())
  or public.is_admin()
  or exists (
    select 1 from public.applications a
    join public.opportunities o on o.id = a.opportunity_id
    where a.user_id = profiles.id and o.created_by = (select auth.uid()) and a.status <> 'a_postuler'
  )
);
drop policy if exists "profil: modification" on public.profiles;
create policy "profil: modification" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Opportunités : seules les offres vérifiées sont publiques
drop policy if exists "offre: lecture" on public.opportunities;
create policy "offre: lecture" on public.opportunities for select to anon, authenticated using (
  status = 'verifiee' or created_by = (select auth.uid()) or public.is_admin()
);
drop policy if exists "offre: publication" on public.opportunities;
create policy "offre: publication" on public.opportunities for insert to authenticated
  with check (created_by = (select auth.uid()) and status = 'en_attente');
drop policy if exists "offre: moderation" on public.opportunities;
create policy "offre: moderation" on public.opportunities for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "offre: suppression" on public.opportunities;
create policy "offre: suppression" on public.opportunities for delete to authenticated
  using (created_by = (select auth.uid()) or public.is_admin());

-- Candidatures : les siennes ; le recruteur voit celles reçues (hors brouillons)
drop policy if exists "candidature: lecture" on public.applications;
create policy "candidature: lecture" on public.applications for select to authenticated using (
  user_id = (select auth.uid())
  or (status <> 'a_postuler' and exists (
    select 1 from public.opportunities o where o.id = opportunity_id and o.created_by = (select auth.uid())))
);
drop policy if exists "candidature: creation" on public.applications;
create policy "candidature: creation" on public.applications for insert to authenticated
  with check (user_id = (select auth.uid()));
drop policy if exists "candidature: modification" on public.applications;
create policy "candidature: modification" on public.applications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "candidature: suppression" on public.applications;
create policy "candidature: suppression" on public.applications for delete to authenticated
  using (user_id = (select auth.uid()));

-- Portfolio
drop policy if exists "portfolio: tout" on public.portfolio_items;
create policy "portfolio: tout" on public.portfolio_items for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Signalements
drop policy if exists "signalement: creation" on public.opportunity_reports;
create policy "signalement: creation" on public.opportunity_reports for insert to authenticated
  with check (user_id = (select auth.uid()));
drop policy if exists "signalement: lecture" on public.opportunity_reports;
create policy "signalement: lecture" on public.opportunity_reports for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- ============ DONNÉES DE DÉMONSTRATION ============
insert into public.opportunities (title, description, organization, org_type, category, skills, location, remote, pay, contact, status)
select * from (values
  ('Assistante gestion des réseaux sociaux', 'Animer la page Facebook et Instagram d''une boutique de pagnes : 3 publications par semaine, réponses aux messages clients.', 'Boutique Ama Pagnes', 'entreprise', 'Communication digitale', array['Réseaux sociaux','Rédaction','Photographie'], 'Lomé', true, '35 000 FCFA / mois', 'contact@amapagnes.tg', 'verifiee'),
  ('Couturière pour commandes d''uniformes', 'Confection de 40 uniformes scolaires. Patrons fournis. Travail à domicile possible.', 'École Les Flamboyants', 'association', 'Couture & mode', array['Couture','Précision','Respect des délais'], 'Lomé — Bè', false, '2 500 FCFA / pièce', 'direction@flamboyants.tg', 'verifiee'),
  ('Soutien scolaire en mathématiques (collège)', 'Cours à domicile pour deux élèves de 4e, 3 séances par semaine en fin d''après-midi.', 'Famille Agbéko', 'particulier', 'Éducation', array['Mathématiques','Pédagogie','Patience'], 'Lomé — Tokoin', false, '2 000 FCFA / heure', 'via NAYA', 'verifiee'),
  ('Saisie et classement de documents', 'Numériser et saisir 500 fiches d''adhérents dans un tableur. Ordinateur fourni sur place.', 'ONG Femmes & Avenir', 'association', 'Administration', array['Saisie','Excel','Organisation'], 'Lomé', false, '50 000 FCFA (mission)', 'rh@femmesavenir.org', 'verifiee'),
  ('Traiteur pour événement (80 personnes)', 'Préparation d''un buffet togolais pour un séminaire d''entreprise. Ingrédients remboursés en plus.', 'Togo Digital Hub', 'entreprise', 'Cuisine & traiteur', array['Cuisine','Organisation','Hygiène'], 'Lomé', false, '120 000 FCFA', 'events@tdhub.tg', 'verifiee'),
  ('Création de visuels pour une campagne', 'Concevoir 10 affiches et visuels Canva pour une campagne de sensibilisation.', 'Association Jeunesse Active', 'association', 'Design graphique', array['Canva','Design graphique','Créativité'], 'À distance', true, '40 000 FCFA (mission)', 'jeunesseactive@gmail.com', 'verifiee'),
  ('Coiffure et tresses — salon partenaire', 'Le salon recherche une coiffeuse à temps partiel, les week-ends.', 'Salon Beauté Divine', 'entreprise', 'Beauté & bien-être', array['Coiffure','Tresses','Relation client'], 'Lomé — Adidogomé', false, 'Commission 40 %', '+228 90 00 00 00', 'verifiee'),
  ('Vendeuse / conseillère en boutique', 'Accueil client, mise en rayon, encaissement. Formation assurée.', 'Supérette du Marché', 'entreprise', 'Commerce & vente', array['Vente','Relation client','Calcul'], 'Kpalimé', false, '45 000 FCFA / mois', 'superette.kpalime@gmail.com', 'verifiee')
) as v(title, description, organization, org_type, category, skills, location, remote, pay, contact, status)
where not exists (select 1 from public.opportunities);

-- Pour devenir administratrice (modération des offres), après inscription :
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'votre@email');
