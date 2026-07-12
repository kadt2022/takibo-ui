import type { ActiveSession } from '@/features/authentication/model/login';
import type { SpacesOutcome, SpaceSummary } from '@/features/organization/model/space';

interface SpacePageResponse {
  content: SpaceSummary[];
}

/**
 * Liste les spaces de l'organisation avec le token ORGANIZATION
 * (surface TMS `GET /api/v1/orgs/{orgId}/spaces`, autorité d'org requise).
 * Le token vit en mémoire et n'est envoyé qu'en en-tête Authorization.
 */
export async function fetchOrganizationSpaces(session: ActiveSession): Promise<SpacesOutcome> {
  const response = await fetch(`/api/v1/orgs/${session.organizationId}/spaces?page=0&size=50`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (response.status === 403) {
    return { kind: 'no-authority' };
  }
  if (!response.ok) {
    throw new Error(`Consultation des spaces impossible (statut ${response.status}).`);
  }

  const page = (await response.json()) as SpacePageResponse;
  return { kind: 'ok', spaces: page.content ?? [] };
}
