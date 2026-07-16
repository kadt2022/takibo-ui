import { useQuery } from '@tanstack/react-query';

import {
  fetchOrganizationSpaces,
  SpacesForbiddenError,
  type OrganizationSpacesQuery,
} from '@/features/spaces/api/spaces-api';
import { useSession } from '@/shared/security/session-context';

/**
 * Charge GET /api/v1/orgs/{organizationId}/spaces (inventaire administratif).
 * `organizationId` = UUID de la session (jamais l'orgCode). Un 403 n'est jamais
 * retenté : la surface se masque, elle ne « réessaie » pas une frontière.
 */
export function useOrganizationSpaces(
  query: OrganizationSpacesQuery,
  options: { enabled?: boolean } = {},
) {
  const { session } = useSession();
  const token = session?.accessToken;
  const organizationId = session?.organizationId;

  return useQuery({
    queryKey: ['org-spaces', organizationId, query],
    queryFn: () => fetchOrganizationSpaces(token as string, organizationId as string, query),
    enabled: Boolean(token) && Boolean(organizationId) && (options.enabled ?? true),
    retry: (failureCount, error) => !(error instanceof SpacesForbiddenError) && failureCount < 1,
  });
}
