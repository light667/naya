-- PHAR — 005 : retire le nom NAYA des données visibles.
-- À exécuter dans Supabase > SQL Editor, après 004. Ré-exécutable sans risque, ne supprime rien.

-- Nom d'auteur par défaut des publications du réseau
alter table public.community_posts alter column author_name set default 'Membre PHAR';

-- Publications déjà enregistrées avec l'ancien nom par défaut
update public.community_posts set author_name = 'Membre PHAR' where author_name = 'Talent NAYA';
