export type SkillLevel = "débutante" | "intermédiaire" | "confirmée";
/** déclarée par la personne · confirmée par l'assistant (repérée dans ses réponses) · validée par un mentor */
export type SkillStatus = "declaree" | "confirmee_assistant" | "validee_mentor";
export type SkillSource = "assistant" | "decouverte" | "de" | "manuel";
export type Skill = {
  name: string;
  category: string;
  level?: SkillLevel;
  /** Une phrase tirée des réponses de la personne qui justifie la compétence. */
  evidence?: string;
  source?: SkillSource;
  status?: SkillStatus;
  /** Date d'ajout, ISO. */
  added_at?: string;
};

export type Suggestion = { title: string; description: string; firstStep: string };

export type PortfolioSectionId = "presentation" | "competences" | "parcours" | "projets" | "galerie";
export type PortfolioSettings = { sections?: { id: PortfolioSectionId; visible: boolean }[]; intro?: string };

export type Profile = {
  id: string;
  full_name: string;
  headline: string;
  city: string;
  bio: string;
  experiences: string;
  education?: string;
  certifications?: string;
  avatar_url?: string;
  interests: string[];
  availability: string;
  skills: Skill[];
  suggestions: Suggestion[];
  role: "talent" | "recruteur" | "admin";
  portfolio_slug?: string | null;
  portfolio_public?: boolean;
  portfolio_settings?: PortfolioSettings;
};

export type Opportunity = {
  id: string;
  created_by: string | null;
  title: string;
  description: string;
  organization: string;
  org_type: "entreprise" | "association" | "particulier";
  category: string;
  skills: string[];
  location: string;
  remote: boolean;
  pay: string;
  contact: string;
  status: "en_attente" | "verifiee" | "rejetee";
  created_at: string;
};

export type ApplicationStatus = "a_postuler" | "envoyee" | "entretien" | "acceptee" | "refusee";

export type Application = {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  message: string;
  notes: string;
  created_at: string;
  updated_at: string;
  opportunities?: Opportunity;
};

export type PortfolioItem = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  link: string;
  category?: string;
  goals?: string;
  role?: string;
  tools?: string[];
  results?: string;
  position?: number;
  created_at: string;
};

export type PortfolioMedia = {
  id: string;
  user_id: string;
  item_id: string | null;
  path: string;
  kind: "image" | "video";
  mime: string;
  size_bytes: number;
  title: string;
  caption: string;
  description: string;
  keywords: string[];
  category: string;
  ai_status: "none" | "proposed" | "accepted";
  position: number;
  created_at: string;
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  a_postuler: "À postuler",
  envoyee: "Envoyée",
  entretien: "Entretien",
  acceptee: "Acceptée",
  refusee: "Refusée",
};

export type Match = { opportunityId: string; score: number; reason: string; complete: boolean };

/* ---------- Assistante ---------- */
export type AssistantKind = "candidature" | "services" | "rendezvous";
export type Tone = "professionnel" | "naturel" | "direct" | "convaincant";
export type Lang = "fr" | "en";
export type Channel = "email" | "whatsapp";

export type CandidatureFormat = "court" | "lettre" | "spontanee";
export type ServiceStyle = "whatsapp" | "proposition" | "publication";
export type ClientType = "particulier" | "entreprise" | "association" | "commerce";
export type MeetingSituation =
  | "rdv_pro"
  | "entretien_apres_candidature"
  | "rencontre_commerciale"
  | "relance_contact"
  | "relance_sans_reponse"
  | "confirmation"
  | "report_annulation"
  | "preparation";
export type Formality = "formel" | "cordial" | "simple";

export type CompatCriterion = { id: string; label: string; weight: number; earned: number; detail: string };
export type Compatibility = {
  complete: boolean;
  score: number | null; // null = analyse incomplète, aucun pourcentage inventé
  criteria: CompatCriterion[];
  matchedSkills: { skill: string; via: string }[];
  partialSkills: { skill: string; via: string }[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  tips: string[];
  questions: { id: string; question: string }[];
  missingData: string[];
};

export type CoherenceCheck = { ok: boolean; issues: string[] };

export type AssistantDraft = {
  id: string;
  user_id: string;
  kind: AssistantKind;
  title: string;
  opportunity_id: string | null;
  params: Record<string, unknown>;
  analysis: Compatibility | null;
  content: string;
  checks: CoherenceCheck | null;
  created_at: string;
  updated_at: string;
  opportunities?: Pick<Opportunity, "id" | "title" | "organization"> | null;
};
