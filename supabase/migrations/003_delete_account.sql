-- NAYA — 003 : suppression de compte par l'utilisatrice elle-même.
-- À exécuter dans Supabase > SQL Editor. Ré-exécutable sans risque.
--
-- Supprime le compte de la personne connectée et toutes ses données :
-- profil, candidatures, portfolio, médias (lignes), historique de l'assistante, signalements
-- (suppression en cascade depuis auth.users), ainsi que les offres qu'elle a publiées.
-- Les fichiers du stockage sont supprimés par l'application juste avant l'appel.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Non connectée';
  end if;
  -- Les offres publiées par ce compte (et les candidatures reçues, par cascade)
  delete from public.opportunities where created_by = uid;
  -- Le reste suit par « on delete cascade »
  delete from auth.users where id = uid;
end $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
