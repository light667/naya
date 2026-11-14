// Moteur local de NAYA : utilisé quand l'IA Claude n'est pas configurée
// (ou indisponible). Simple, déterministe, sans appel réseau.
import type { Match, Opportunity, Profile, Skill, Suggestion, WriteMode } from "./types";

type Rule = { keys: string[]; skill: Skill };

const RULES: Rule[] = [
  { keys: ["cousu", "couture", "coudre", "pagne", "vêtement", "retouche", "tailleur"], skill: { name: "Couture", category: "Couture & mode" } },
  { keys: ["cuisine", "cuisiner", "plat", "pâtisserie", "gâteau", "traiteur", "repas"], skill: { name: "Cuisine", category: "Cuisine & traiteur" } },
  { keys: ["tresse", "coiffure", "coiffer", "cheveux", "natte"], skill: { name: "Coiffure & tresses", category: "Beauté & bien-être" } },
  { keys: ["maquillage", "ongle", "manucure", "esthétique"], skill: { name: "Esthétique & maquillage", category: "Beauté & bien-être" } },
  { keys: ["facebook", "instagram", "tiktok", "whatsapp", "réseaux sociaux", "publication", "community"], skill: { name: "Réseaux sociaux", category: "Communication digitale" } },
  { keys: ["canva", "affiche", "flyer", "visuel", "dessin", "design", "logo"], skill: { name: "Design graphique", category: "Design graphique" } },
  { keys: ["photo", "photographie", "vidéo", "filmer", "montage"], skill: { name: "Photo & vidéo", category: "Communication digitale" } },
  { keys: ["écrire", "rédaction", "rédiger", "texte", "article", "blog"], skill: { name: "Rédaction", category: "Communication digitale" } },
  { keys: ["vendre", "vente", "commerce", "boutique", "marché", "client"], skill: { name: "Vente", category: "Commerce & vente" } },
  { keys: ["négocier", "négociation", "convaincre"], skill: { name: "Négociation", category: "Commerce & vente" } },
  { keys: ["argent", "caisse", "compte", "budget", "tontine", "épargne", "comptabilité"], skill: { name: "Gestion financière", category: "Administration" } },
  { keys: ["excel", "word", "ordinateur", "saisie", "informatique", "bureautique"], skill: { name: "Bureautique", category: "Administration" } },
  { keys: ["organiser", "organisation", "planifier", "événement", "cérémonie", "mariage", "fête"], skill: { name: "Organisation d'événements", category: "Événementiel" } },
  { keys: ["enfant", "garde", "baby", "nounou", "petits frères", "petites sœurs"], skill: { name: "Garde d'enfants", category: "Services à la personne" } },
  { keys: ["aide aux devoirs", "enseigner", "expliquer", "cours", "répétitrice", "devoirs", "élève"], skill: { name: "Pédagogie & soutien scolaire", category: "Éducation" } },
  { keys: ["math", "calcul"], skill: { name: "Mathématiques", category: "Éducation" } },
  { keys: ["anglais", "english"], skill: { name: "Anglais", category: "Langues" } },
  { keys: ["ewe", "éwé", "kabyè", "mina", "langue", "traduire", "traduction"], skill: { name: "Langues locales & traduction", category: "Langues" } },
  { keys: ["soigner", "santé", "malade", "infirmi", "secourisme"], skill: { name: "Soins & assistance", category: "Services à la personne" } },
  { keys: ["chant", "chanter", "danse", "danser", "musique", "théâtre"], skill: { name: "Arts du spectacle", category: "Arts & culture" } },
  { keys: ["perle", "bijou", "artisanat", "savon", "tricot", "crochet", "vannerie"], skill: { name: "Artisanat", category: "Artisanat" } },
  { keys: ["jardin", "agricult", "champ", "élevage", "maraîch"], skill: { name: "Agriculture & maraîchage", category: "Agriculture" } },
  { keys: ["ménage", "nettoyage", "repassage", "lessive"], skill: { name: "Entretien & ménage", category: "Services à la personne" } },
  { keys: ["écoute", "conseil", "aider les autres", "bénévol"], skill: { name: "Écoute & accompagnement", category: "Savoir-être" } },
  { keys: ["groupe", "équipe", "association", "chorale", "déléguée", "responsable", "leader"], skill: { name: "Leadership & travail d'équipe", category: "Savoir-être" } },
  { keys: ["ponctuel", "rigueur", "sérieuse", "organisée"], skill: { name: "Rigueur & fiabilité", category: "Savoir-être" } },
];

const ACTIVITIES: Record<string, Suggestion> = {
  "Couture & mode": { title: "Retouches et confection sur commande", description: "Proposez retouches, ourlets et tenues en pagne à votre entourage puis en ligne.", firstStep: "Photographiez 3 pièces réalisées et publiez-les dans votre portfolio NAYA." },
  "Cuisine & traiteur": { title: "Petite restauration et service traiteur", description: "Plats du jour, pâtisseries ou buffets pour bureaux, fêtes et événements.", firstStep: "Fixez un menu de 3 plats avec leurs prix et faites goûter à 5 personnes." },
  "Beauté & bien-être": { title: "Coiffure / esthétique à domicile", description: "Tresses, coiffures et soins proposés chez les clientes ou en salon partenaire.", firstStep: "Créez une grille de tarifs et 5 photos avant/après." },
  "Communication digitale": { title: "Gestion de réseaux sociaux pour commerces", description: "Les petites boutiques ont besoin de publications régulières et de réponses aux clients.", firstStep: "Proposez un mois d'essai à un commerce de votre quartier." },
  "Design graphique": { title: "Création de visuels (affiches, flyers, logos)", description: "Visuels Canva pour associations, églises, commerces et événements.", firstStep: "Réalisez 3 visuels fictifs pour montrer votre style." },
  "Commerce & vente": { title: "Revente et vente en ligne", description: "Vente de produits via WhatsApp/Facebook ou poste de vendeuse en boutique.", firstStep: "Listez 2 produits que vous connaissez bien et identifiez un fournisseur." },
  Administration: { title: "Assistance administrative et saisie", description: "Saisie de données, classement, tenue de petits comptes pour structures locales.", firstStep: "Préparez une présentation de vos services avec l'assistant NAYA." },
  Événementiel: { title: "Organisation et animation d'événements", description: "Coordination de cérémonies, décoration, accueil d'invités.", firstStep: "Notez les événements que vous avez déjà aidé à organiser comme références." },
  "Services à la personne": { title: "Services à domicile", description: "Garde d'enfants, aide aux personnes âgées ou entretien.", firstStep: "Rassemblez 2 recommandations de familles qui vous font confiance." },
  Éducation: { title: "Soutien scolaire / répétitions", description: "Cours particuliers à domicile ou en petits groupes.", firstStep: "Choisissez vos matières et niveaux, puis fixez un tarif horaire." },
  Langues: { title: "Traduction et interprétariat", description: "Traduction de documents ou accompagnement en langues locales et en anglais.", firstStep: "Indiquez vos langues et votre niveau dans votre profil." },
  "Arts & culture": { title: "Animation artistique", description: "Animation de fêtes, ateliers pour enfants, prestations.", firstStep: "Enregistrez une courte vidéo de démonstration." },
  Artisanat: { title: "Création et vente d'objets artisanaux", description: "Bijoux, savons, accessoires vendus en ligne et sur les marchés.", firstStep: "Calculez le coût de revient d'une pièce pour fixer un prix juste." },
  Agriculture: { title: "Maraîchage et transformation", description: "Production ou transformation (jus, condiments) vendue localement.", firstStep: "Identifiez un produit transformé facile à vendre près de chez vous." },
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function localExtractSkills(text: string): { skills: Skill[]; suggestions: Suggestion[]; summary: string } {
  const t = norm(text);
  const found = new Map<string, Skill>();
  for (const r of RULES) {
    if (r.keys.some((k) => t.includes(norm(k)))) found.set(r.skill.name, { ...r.skill, level: "intermédiaire" });
  }
  const skills = [...found.values()];
  const cats = [...new Set(skills.map((s) => s.category))].filter((c) => ACTIVITIES[c]);
  const suggestions = cats.slice(0, 4).map((c) => ACTIVITIES[c]);
  const summary = skills.length
    ? `Nous avons repéré ${skills.length} compétence${skills.length > 1 ? "s" : ""} dans votre parcours, y compris des savoir-faire acquis en dehors de l'école. Vérifiez-les et ajustez-les librement.`
    : "Nous n'avons pas encore repéré de compétences précises. Décrivez davantage ce que vous faites au quotidien : aider la famille, vendre, organiser, créer…";
  return { skills, suggestions, summary };
}

export function localMatch(profile: Pick<Profile, "skills" | "interests" | "city">, opps: Opportunity[]): Match[] {
  const mySkills = profile.skills.map((s) => norm(s.name));
  const myCats = profile.skills.map((s) => norm(s.category));
  const interests = profile.interests.map(norm);
  const city = norm(profile.city || "");
  return opps
    .map((o) => {
      let score = 20;
      const reasons: string[] = [];
      const oSkills = o.skills.map(norm);
      const hits = o.skills.filter((_, i) => mySkills.some((m) => m.includes(oSkills[i]) || oSkills[i].includes(m)));
      score += Math.min(45, hits.length * 20);
      if (hits.length) reasons.push(`vous maîtrisez ${hits.join(", ")}`);
      if (myCats.includes(norm(o.category))) { score += 20; reasons.push(`correspond à votre domaine (${o.category})`); }
      if (interests.some((i) => norm(o.category + " " + o.title + " " + o.description).includes(i))) { score += 10; reasons.push("rejoint vos centres d'intérêt"); }
      if (o.remote) { score += 5; reasons.push("possible à distance"); }
      else if (city && norm(o.location).includes(city)) { score += 5; reasons.push("près de chez vous"); }
      return {
        opportunityId: o.id,
        score: Math.min(98, score),
        reason: reasons.length ? capitalize(reasons.join(" · ")) : "Une occasion de découvrir un nouveau domaine.",
      };
    })
    .sort((a, b) => b.score - a.score);
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function localWrite(mode: WriteMode, profile: Profile, opp?: Opportunity | null, extra?: string): string {
  const name = profile.full_name || "Je";
  const skills = profile.skills.slice(0, 4).map((s) => s.name.toLowerCase());
  const skillsTxt = skills.length ? skills.join(", ") : "ma motivation et ma capacité d'apprendre vite";
  if (mode === "candidature") {
    return `Objet : Candidature — ${opp?.title ?? "mission"}

Bonjour${opp ? ` à l'équipe de ${opp.organization}` : ""},

Je m'appelle ${name}${profile.city ? `, j'habite à ${profile.city}` : ""}, et je souhaite vous proposer ma candidature${opp ? ` pour la mission « ${opp.title} »` : ""}.

Au fil de mes expériences${profile.experiences ? ` (${profile.experiences.slice(0, 140).trim()}${profile.experiences.length > 140 ? "…" : ""})` : ""}, j'ai développé des compétences en ${skillsTxt}. Je suis sérieuse, ponctuelle et j'aime le travail bien fait.
${extra ? `\n${extra}\n` : ""}
${profile.availability ? `Je suis disponible ${profile.availability.toLowerCase()}. ` : ""}Je serais heureuse d'échanger avec vous pour vous présenter mes réalisations.

Merci pour votre attention,
${profile.full_name}`;
  }
  if (mode === "presentation") {
    return `✨ ${profile.full_name || "Mon activité"} — ${profile.headline || "Services sur mesure"}

Qui suis-je ?
${profile.bio || `Une jeune femme motivée${profile.city ? ` basée à ${profile.city}` : ""}, passionnée par ce qu'elle fait.`}

Ce que je propose :
${(profile.skills.length ? profile.skills : [{ name: "Services personnalisés" }]).slice(0, 5).map((s) => `• ${s.name}`).join("\n")}

Pourquoi me faire confiance ?
• Travail soigné et dans les délais
• Écoute de vos besoins
• Tarifs adaptés
${extra ? `\n${extra}\n` : ""}
📍 ${profile.city || "Ma ville"} ${profile.availability ? `· Disponible ${profile.availability.toLowerCase()}` : ""}
Contactez-moi pour un devis gratuit !`;
  }
  return `Préparer votre échange${opp ? ` avec ${opp.organization}` : ""}

1. Présentez-vous en 30 secondes : qui vous êtes, ce que vous savez faire (${skillsTxt}), pourquoi cette mission vous intéresse.
2. Préparez 2 exemples concrets : une situation où vous avez réussi quelque chose, et une difficulté surmontée.
3. Questions probables :
   • « Parlez-moi de vous. »
   • « Pourquoi cette mission ? »
   • « Quelles sont vos disponibilités ? »
   • « Quel est votre tarif ? » → ayez un chiffre en tête${opp?.pay ? ` (annoncé : ${opp.pay})` : ""}.
4. Vos questions à poser : déroulé de la mission, délais, mode de paiement.
5. Sécurité : rencontrez-vous dans un lieu public ou connu, prévenez un proche, ne payez jamais de « frais d'inscription ».
${extra ? `\nNote : ${extra}` : ""}`;
}
