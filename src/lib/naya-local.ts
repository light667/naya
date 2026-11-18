// Moteur local de NAYA : utilisé quand l'IA distante n'est pas configurée
// ou en secours réseau. Fournit des réponses riches, expertes et bienveillantes,
// sans syntaxe Markdown brute.
import type { Skill, Suggestion } from "./types";

export type Rule = { keys: string[]; skill: Skill };

export const RULES: Rule[] = [
  { keys: ["cousu", "couture", "coudre", "pagne", "vêtement", "retouche", "tailleur", "wax"], skill: { name: "Couture & confection", category: "Couture & mode" } },
  { keys: ["cuisine", "cuisiner", "plat", "pâtisserie", "gâteau", "traiteur", "repas"], skill: { name: "Cuisine & traiteur", category: "Cuisine & traiteur" } },
  { keys: ["tresse", "coiffure", "coiffer", "cheveux", "natte"], skill: { name: "Coiffure & tresses", category: "Beauté & bien-être" } },
  { keys: ["maquillage", "ongle", "manucure", "esthétique"], skill: { name: "Esthétique & soins", category: "Beauté & bien-être" } },
  { keys: ["facebook", "instagram", "tiktok", "whatsapp", "réseaux sociaux", "publication", "community"], skill: { name: "Gestion réseaux sociaux", category: "Communication digitale" } },
  { keys: ["canva", "affiche", "flyer", "visuel", "dessin", "design", "logo"], skill: { name: "Création graphique (Canva)", category: "Design graphique" } },
  { keys: ["photo", "photographie", "vidéo", "filmer", "montage"], skill: { name: "Prise de vue & vidéo mobile", category: "Communication digitale" } },
  { keys: ["écrire", "rédaction", "rédiger", "texte", "article", "blog"], skill: { name: "Rédaction professionnelle", category: "Communication digitale" } },
  { keys: ["vendre", "vente", "commerce", "boutique", "marché", "client"], skill: { name: "Vente & relation client", category: "Commerce & vente" } },
  { keys: ["négocier", "négociation", "convaincre", "prix"], skill: { name: "Négociation commerciale", category: "Commerce & vente" } },
  { keys: ["argent", "caisse", "compte", "budget", "tontine", "épargne", "comptabilité"], skill: { name: "Gestion de caisse & budget", category: "Administration" } },
  { keys: ["excel", "word", "ordinateur", "saisie", "informatique", "bureautique"], skill: { name: "Outils bureautiques", category: "Administration" } },
  { keys: ["organiser", "organisation", "planifier", "événement", "cérémonie", "mariage", "fête"], skill: { name: "Organisation logistique", category: "Événementiel" } },
  { keys: ["enfant", "garde", "baby", "nounou", "petits frères", "petites sœurs"], skill: { name: "Garde & encadrement d'enfants", category: "Services à la personne" } },
  { keys: ["aide aux devoirs", "enseigner", "expliquer", "cours", "répétitrice", "devoirs", "élève"], skill: { name: "Soutien scolaire & pédagogie", category: "Éducation" } },
  { keys: ["math", "calcul"], skill: { name: "Calcul commercial", category: "Éducation" } },
  { keys: ["anglais", "english"], skill: { name: "Anglais professionnel", category: "Langues" } },
  { keys: ["ewe", "éwé", "kabyè", "mina", "fon", "wolof", "bambara", "langue", "traduire", "traduction"], skill: { name: "Médiation linguistique locale", category: "Langues" } },
  { keys: ["soigner", "santé", "malade", "infirmi", "secourisme"], skill: { name: "Assistance premiers secours", category: "Services à la personne" } },
  { keys: ["chant", "chanter", "danse", "danser", "musique", "théâtre"], skill: { name: "Animation artistique", category: "Arts & culture" } },
  { keys: ["perle", "bijou", "artisanat", "savon", "tricot", "crochet", "vannerie", "cuir"], skill: { name: "Fabrication artisanale", category: "Artisanat" } },
  { keys: ["jardin", "agricult", "champ", "élevage", "maraîch"], skill: { name: "Production agricole & maraîchage", category: "Agriculture" } },
  { keys: ["ménage", "nettoyage", "repassage", "lessive"], skill: { name: "Entretien professionnel", category: "Services à la personne" } },
  { keys: ["écoute", "conseil", "aider les autres", "bénévol"], skill: { name: "Médiation & sens de l'écoute", category: "Savoir-être" } },
  { keys: ["groupe", "équipe", "association", "chorale", "déléguée", "responsable", "leader"], skill: { name: "Coordination d'équipe", category: "Savoir-être" } },
  { keys: ["ponctuel", "rigueur", "sérieuse", "organisée"], skill: { name: "Rigueur opérationnelle", category: "Savoir-être" } },
];

export const ACTIVITIES: Record<string, Suggestion> = {
  "Couture & mode": { title: "Confection & retouches sur mesure", description: "Propose des retouches rapides et des modèles wax personnalisés pour une clientèle de quartier et sur commande.", firstStep: "Prends en photo 3 de tes créations sous un bel éclairage naturel et ajoute-les à ton portfolio." },
  "Cuisine & traiteur": { title: "Restauration pour bureaux et événements", description: "Paniers repas du midi, collations saines ou pâtisseries pour entreprises et particuliers.", firstStep: "Définis un menu simple de 3 spécialités avec le coût de revient exact par portion." },
  "Beauté & bien-être": { title: "Prestations beauté & soins à domicile", description: "Tresses soignées, manucure ou soins capillaires chez les clientes ou en salon partenaire.", firstStep: "Fixe ta grille tarifaire et crée un album photo WhatsApp avant/après." },
  "Communication digitale": { title: "Gestion de présence WhatsApp & réseaux", description: "Aide les commerçants locaux à publier leurs nouveautés et répondre rapidement aux clients.", firstStep: "Contacte une boutique de ton quartier pour proposer d'animer son catalogue WhatsApp pendant 2 semaines." },
  "Design graphique": { title: "Création de visuels Canva professionnels", description: "Affiches promotionnelles, menus, étiquettes produits et logos pour micro-entrepreneurs.", firstStep: "Réalise 3 modèles de démonstration (ex: affiche de promotion pour un restaurant local)." },
  "Commerce & vente": { title: "Vente conseil & gestion de stand", description: "Accueil client, fidélisation, valorisation des produits et tenue des inventaires.", firstStep: "Rédige une fiche résumant ton expérience de vente et ton aisance relationnelle." },
  Administration: { title: "Assistance de gestion & saisie", description: "Tenue des registres de caisse, saisie des commandes et organisation des dossiers.", firstStep: "Mets en avant ta maîtrise des calculs et de la rigueur dans tes notes." },
  Événementiel: { title: "Coordination & accueil d'événements", description: "Accueil des invités, gestion du protocole et organisation logistique lors de cérémonies.", firstStep: "Liste les 2 derniers événements que tu as aidé à organiser et ton rôle précis." },
  "Services à la personne": { title: "Services de confiance aux familles", description: "Garde bienveillante d'enfants, soutien au foyer ou accompagnement d'aînés.", firstStep: "Rassemble 2 témoignages ou recommandations de personnes qui connaissent ton sérieux." },
  Éducation: { title: "Répétitions & cours de soutien scolaire", description: "Accompagnement d'élèves du primaire ou collège pour les devoirs du soir.", firstStep: "Détermine les classes que tu maîtrises le mieux et prépare un plan d'une séance type." },
  Langues: { title: "Interprétariat & médiation locale", description: "Accompagnement de visiteurs ou traduction de consignes entre langues locales et français.", firstStep: "Précise sur ton profil tes langues parlées et ton niveau d'aisance." },
  Artisanat: { title: "Création d'accessoires & maroquinerie", description: "Fabrication de sacs, bijoux perlés ou objets décoratifs pour boutiques et marchés d'art.", firstStep: "Calcule le prix matière de chaque pièce pour garantir une marge bénéficiaire saine." },
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function localExtractSkills(text: string): { skills: Skill[]; suggestions: Suggestion[]; summary: string } {
  const t = norm(text);
  const found = new Map<string, Skill>();
  for (const r of RULES) {
    if (r.keys.some((k) => t.includes(norm(k)))) {
      found.set(r.skill.name, { ...r.skill, level: "intermédiaire" });
    }
  }
  const skills = [...found.values()];
  const cats = [...new Set(skills.map((s) => s.category))].filter((c) => ACTIVITIES[c]);
  const suggestions = cats.slice(0, 4).map((c) => ACTIVITIES[c]);
  const summary = skills.length
    ? `Nous avons identifié ${skills.length} compétence${skills.length > 1 ? "s" : ""} concrète${skills.length > 1 ? "s" : ""} dans votre récit. Vous pouvez les intégrer directement à votre profil pro.`
    : "Je n'ai pas encore repéré de mots-clés techniques précis. Parlez-moi plus de vos activités de tous les jours : couture, commerce, tenue de caisse, organisation, vente ?";
  return { skills, suggestions, summary };
}

/**
 * Moteur conversationnel local intelligent pour l'assistant IA NAYA.
 * Fournit des réponses rédigées en texte naturel sans balisage Markdown.
 */
export function localChatResponse(message: string, context?: { userName?: string; skills?: string[] }): {
  reply: string;
  detectedSkills: string[];
  suggestions: string[];
} {
  const t = norm(message);
  const name = context?.userName ? ` ${context.userName}` : "";

  const extraction = localExtractSkills(message);
  const detectedSkills = extraction.skills.map((s) => s.name);

  const isTarif = t.includes("tarif") || t.includes("prix") || t.includes("combien") || t.includes("fcfa") || t.includes("payer") || t.includes("devis") || t.includes("cout");
  const isEntretien = t.includes("entretien") || t.includes("embauche") || t.includes("recruteur") || t.includes("question") || t.includes("stress") || t.includes("presenter");
  const isClient = t.includes("client") || t.includes("trouver") || t.includes("prospection") || t.includes("whatsapp") || t.includes("vente") || t.includes("vendre");
  const isCouture = t.includes("couture") || t.includes("wax") || t.includes("tissu") || t.includes("patron") || t.includes("habit") || t.includes("retouche");
  const isInformel = t.includes("diplome") || t.includes("ecole") || t.includes("atelier") || t.includes("tas") || t.includes("famille") || t.includes("marche");

  let reply = "";
  const suggestions: string[] = [];

  if (isTarif) {
    reply = `Voici quelques repères pratiques pour fixer tes tarifs avec assurance${name}.\n\n` +
      `La formule de base :\n` +
      `Tarif = Coût des fournitures + (Nombre d'heures passées multiplié par ton taux horaire) + Marge de sécurité de 10 à 15%.\n\n` +
      `Repères courants sur le marché en Afrique de l'Ouest et Centrale :\n` +
      `- Confection wax sur mesure : 6 000 à 25 000 FCFA selon la complexité et les finitions.\n` +
      `- Retouches d'ourlet ou ajustements : 1 000 à 3 000 FCFA par vêtement.\n` +
      `- Gestion de catalogue WhatsApp et réseaux pour commerce : 35 000 à 100 000 FCFA par mois selon le volume.\n` +
      `- Vente et tenue de caisse en boutique : 50 000 à 120 000 FCFA par mois.\n\n` +
      `La règle d'or : ne baisse jamais tes prix sans réduire en contrepartie le service (par exemple un délai plus long ou des fournitures à la charge du client). Ta précision et ton sérieux méritent une rémunération juste.`;

    suggestions.push(
      "Comment expliquer mes tarifs à un client qui négocie trop ?",
      "Rédige-moi un devis clair pour un modèle wax",
      "Quelles sont les compétences les plus recherchées ?"
    );
  } else if (isEntretien) {
    reply = `Préparer un entretien est la clé de la sérénité${name}. Voici une structure efficace en trois étapes :\n\n` +
      `1. La présentation concise :\n` +
      `Présente ton prénom, ta ville et ton métier. Cite ensuite deux réalisations concrètes de terrain, comme le nombre de tenues confectionnées sans défaut ou la gestion d'une caisse sans écart.\n\n` +
      `2. La réponse à la question sur les diplômes :\n` +
      `Explique avec calme que c'est sur le terrain et en atelier que tu as acquis ta rigueur et le sens du travail bien fait. Pour un employeur, la ponctualité et la qualité du travail rendu sont prioritaires.\n\n` +
      `3. Règle de sécurité :\n` +
      `Un recruteur vérifié sur PHAR ne te demandera jamais de verser des frais de dossier ou de caution pour être embauché. Si cela arrive, refuse fermement et signale-le immédiatement.`;

    suggestions.push(
      "Simule une question d'entretien pour tester ma réponse",
      "Rédige mon message de candidature pour une boutique",
      "Comment parler de mes disponibilités ?"
    );
  } else if (isClient) {
    reply = `Pour attirer tes premiers clients fidèles${name}, voici un plan d'action simple :\n\n` +
      `1. Optimise ton profil WhatsApp Business avec une photo soignée, tes horaires, ta zone géographique et trois de tes meilleures pièces dans ton catalogue avec leurs tarifs.\n\n` +
      `2. Contacte directement cinq personnes de ton entourage professionnel pour leur faire part de tes créneaux disponibles cette semaine.\n\n` +
      `3. Mets en avant des photos nettes de tes finitions sous une bonne lumière naturelle, car c'est ce qui rassure immédiatement un client.`;

    suggestions.push(
      "Rédige-moi un message type WhatsApp de prospection",
      "Comment gérer un client difficile ?",
      "Aide-moi à organiser mes publications"
    );
  } else if (isCouture) {
    reply = `Le secteur de la confection textile et du wax offre de belles perspectives${name}.\n\n` +
      `Ce qui fait la réputation d'un atelier, c'est la régularité des finitions, l'alignement précis des motifs wax au niveau des raccords et le strict respect des délais convenus.\n\n` +
      `Pour valoriser ton savoir-faire, précise toujours si tu travailles sur mesure, à partir de patrons ou par reproduction de modèles d'après photo.`;

    suggestions.push(
      "Comment calculer mon prix par modèle ?",
      "Quelles compétences valoriser en couture ?",
      "Aide-moi à décrire mes créations"
    );
  } else if (isInformel) {
    reply = `Chaque expérience pratique a une valeur professionnelle directe${name}.\n\n` +
      `Ce que tu as appris hors de l'école se traduit en compétences recherchées par les entreprises :\n` +
      `- Aider au magasin familial correspond à la gestion des stocks, la tenue de caisse et la relation client.\n` +
      `- Coudre pour son entourage correspond à la gestion des commandes sur mesure, la fidélisation et la maîtrise technique textile.\n` +
      `- Gérer une tontine correspond au suivi de trésorerie et à la rigueur d'organisation.\n\n` +
      `Décris-moi tes activités quotidiennes, et je t'aide à les formuler de manière claire et professionnelle pour ton profil.`;

    suggestions.push(
      "Voici ce que je faisais au quotidien",
      "Comment formuler cela sur mon profil ?",
      "Existe-t-il des formations pratiques associées ?"
    );
  } else {
    const intro = detectedSkills.length > 0
      ? `J'ai bien noté tes compétences en ${detectedSkills.join(", ")}.`
      : "Je suis à tes côtés pour t'orienter dans ton parcours professionnel.";

    reply = `Bonjour${name}. ${intro}\n\n` +
      `Mon objectif est de t'aider à valoriser tes savoir-faire et à saisir des opportunités adaptées.\n\n` +
      `Nous pouvons travailler ensemble sur :\n` +
      `- L'identification et la formulation de tes compétences de terrain\n` +
      `- La rédaction de messages de candidature adaptés\n` +
      `- Le calcul de tes tarifs et la préparation de tes devis\n` +
      `- L'entraînement à tes futurs entretiens d'embauche\n\n` +
      `Sur quel sujet souhaites-tu avancer en premier ?`;

    suggestions.push(
      "Aide-moi à faire le point sur mes compétences",
      "Comment valoriser mes expériences sans diplôme ?",
      "Quels tarifs puis-je demander pour mes prestations ?"
    );
  }

  return { reply, detectedSkills, suggestions };
}
