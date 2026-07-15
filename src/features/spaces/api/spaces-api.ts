import type {
  AccessibleSpace,
  CurrentUserSpacesResponse,
  OrganizationSpacePage,
} from '@/features/spaces/model/space';

/**
 * Refus de frontière (HTTP 403) : le contexte du token ne permet pas cette
 * surface. Distinct d'une erreur technique — l'UI masque la surface plutôt que
 * d'afficher une erreur globale.
 */
export class SpacesForbiddenError extends Error {
  constructor(message = 'Accès refusé à cette surface.') {
    super(message);
    this.name = 'SpacesForbiddenError';
  }
}

/** Échec technique récupérable (réseau, 5xx, réponse illisible). */
export class SpacesApiError extends Error {
  constructor(message = 'Chargement impossible pour le moment.') {
    super(message);
    this.name = 'SpacesApiError';
  }
}

async function authGet<T>(path: string, token: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new SpacesApiError('Le service TAKIBO est injoignable.');
  }

  if (response.status === 403) {
    throw new SpacesForbiddenError();
  }
  if (!response.ok) {
    throw new SpacesApiError();
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new SpacesApiError();
  }
}

/** GET /api/v1/me/spaces → les Spaces d'appartenance du compte courant. */
export async function fetchMySpaces(token: string): Promise<AccessibleSpace[]> {
  const response = await authGet<CurrentUserSpacesResponse>('/api/v1/me/spaces', token);
  return response.items;
}

export interface OrganizationSpacesQuery {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
}

/**
 * GET /api/v1/orgs/{organizationId}/spaces → inventaire administratif.
 * Le segment est l'UUID {@code organizationId}, jamais l'orgCode lisible.
 */
export function fetchOrganizationSpaces(
  token: string,
  organizationId: string,
  query: OrganizationSpacesQuery = {},
): Promise<OrganizationSpacePage> {
  const params = new URLSearchParams();
  params.set('page', String(query.page ?? 0));
  params.set('size', String(query.size ?? 20));
  if (query.status) {
    params.set('status', query.status);
  }
  if (query.search && query.search.trim()) {
    params.set('search', query.search.trim());
  }
  return authGet<OrganizationSpacePage>(
    `/api/v1/orgs/${organizationId}/spaces?${params.toString()}`,
    token,
  );
}
