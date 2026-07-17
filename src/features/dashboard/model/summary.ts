/**
 * Résumé réel du tableau de bord organisationnel (récit backend Dashboard 01).
 * Contrat de GET /api/v1/orgs/{organizationId}/dashboard/summary.
 *
 * `usersTotal` / `activeUsersTotal` comptent des COMPTES DISTINCTS de
 * l'organisation : un même compte présent dans plusieurs Spaces ne compte
 * qu'une fois. Ce ne sont donc pas des totaux « par Space ».
 *
 * Le dashboard n'affiche que `usersTotal` et `spacesTotal` ; `activeUsersTotal`
 * reste dans le contrat pour la future page dédiée /app/organization/users.
 */
export interface OrganizationDashboardSummary {
  organizationId: string;
  usersTotal: number;
  activeUsersTotal: number;
  spacesTotal: number;
  generatedAt: string;
}
