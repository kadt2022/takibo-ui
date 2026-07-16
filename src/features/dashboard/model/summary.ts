/**
 * Résumé réel du tableau de bord organisationnel (récit backend Dashboard 01).
 * Contrat de GET /api/v1/orgs/{organizationId}/dashboard/summary.
 *
 * `usersTotal` / `activeUsersTotal` comptent des COMPTES DISTINCTS de
 * l'organisation : un même compte présent dans plusieurs Spaces ne compte
 * qu'une fois. Ce ne sont donc pas des totaux « par Space ».
 */
export interface OrganizationDashboardSummary {
  organizationId: string;
  usersTotal: number;
  activeUsersTotal: number;
  spacesTotal: number;
  generatedAt: string;
}
