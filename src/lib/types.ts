export type Skill = { name: string; category: string; level?: "débutante" | "intermédiaire" | "confirmée" };

export type Suggestion = { title: string; description: string; firstStep: string };

export type Profile = {
  id: string;
  full_name: string;
  headline: string;
  city: string;
  bio: string;
  experiences: string;
  interests: string[];
  availability: string;
  skills: Skill[];
  suggestions: Suggestion[];
  role: "talent" | "recruteur" | "admin";
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

export type PortfolioItem = { id: string; user_id: string; title: string; description: string; link: string; created_at: string };

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  a_postuler: "À postuler",
  envoyee: "Envoyée",
  entretien: "Entretien",
  acceptee: "Acceptée",
  refusee: "Refusée",
};

export type Match = { opportunityId: string; score: number; reason: string };

export type AiKind = "skills" | "match" | "write";
export type WriteMode = "candidature" | "presentation" | "entretien";
