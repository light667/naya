# PHAR

La plateforme intelligente de valorisation des compétences et d'autonomisation économique des jeunes femmes (18–30 ans).

**Stack :** Next.js 15 (App Router) · Tailwind CSS 4 · Supabase (Auth + Postgres + RLS) · Mistral AI pour l'IA (rédaction, vision, transcription vocale).

## Démarrer

1. **Base de données** — dans Supabase > *SQL Editor*, exécuter `supabase/migrations/001_naya_init.sql`
   (tables, sécurité RLS, création auto du profil à l'inscription, 8 opportunités de démonstration).
2. **Variables** — `.env.local` contient déjà l'URL et la clé publique Supabase.
   Pour activer l'IA, renseigner `MISTRAL_API_KEY` (console.mistral.ai). Sans clé, PHAR utilise son moteur local (règles + modèles de texte) ; la description des médias et la transcription serveur nécessitent la clé.
   Exécuter aussi `supabase/migrations/002_assistant_portfolio.sql` dans le SQL Editor (réparation des accents, historique de l'assistante, médias et lien public du portfolio).
3. `npm install` puis `npm run dev` → http://localhost:3000

Pour tester rapidement, désactiver la confirmation d'e-mail : Supabase > Authentication > Sign In / Providers > Email > *Confirm email*.

**Devenir administratrice** (modération des offres) après inscription :

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'votre@email');
```

## Fonctionnalités

| Écran | Rôle |
|---|---|
| Découverte des compétences | 5 questions sur le quotidien → l'IA révèle les compétences (y compris informelles) et suggère des activités rémunératrices avec un premier pas concret |
| Profil professionnel | Titre, ville, présentation, expériences, intérêts, disponibilités, niveau de chaque compétence |
| Opportunités | Missions vérifiées, score de compatibilité, recommandations IA expliquées, filtres, signalement d'offre suspecte |
| Suivi | Candidatures par statut (à postuler → envoyée → entretien → acceptée/refusée) avec notes |
| Portfolio | Réalisations avec description et lien |
| Assistante IA | Candidature, présentation de services (WhatsApp/Facebook), préparation aux échanges + conseils de sécurité |
| Mes offres (recruteurs) | Publier une mission (vérifiée avant mise en ligne), voir les candidatures reçues |
| Modération (admin) | Valider/refuser les offres, détection de signaux de fraude, traitement des signalements |

## Confiance & données

- Une offre n'est visible publiquement qu'une fois **vérifiée** par une administratrice.
- Un recruteur ne voit le profil d'une candidate **que si elle lui a envoyé une candidature**.
- Une utilisatrice ne peut pas s'attribuer le rôle admin (garde-fou en base).
- L'IA ne garantit pas un emploi : elle propose, l'utilisatrice décide et relit toujours avant d'envoyer.
