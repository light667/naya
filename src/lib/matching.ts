import { compatReason, computeCompatibility } from "./compat";
import type { Match, Opportunity, PortfolioItem, Profile } from "./types";

/** Classe les missions avec le même calcul que l'analyse de l'assistante (score identique partout). */
export function rankOpportunities(profile: Profile, opps: Opportunity[], items: PortfolioItem[] = []): Match[] {
  return opps
    .map((o) => {
      const c = computeCompatibility(profile, o, items);
      return { opportunityId: o.id, score: c.score ?? 0, complete: c.complete, reason: compatReason(c) };
    })
    .sort((a, b) => Number(b.complete) - Number(a.complete) || b.score - a.score);
}
