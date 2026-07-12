/** Résumé d'un space (SpaceSummaryResponse de TMS, PR #30). */
export interface SpaceSummary {
  id: string;
  orgId: string;
  code: string;
  name: string;
  status: string;
}

/**
 * Issue de la consultation des spaces avec un token ORGANIZATION :
 * la surface TMS exige une autorité d'organisation (R_ORG_OWNER/R_ORG_ADMIN).
 * Un compte sans autorité reçoit `no-authority` — sa liste personnelle
 * arrivera avec le récit IAM 32.
 */
export type SpacesOutcome = { kind: 'ok'; spaces: SpaceSummary[] } | { kind: 'no-authority' };
