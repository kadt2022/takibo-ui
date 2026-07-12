export interface LoginCredentials {
  email: string;
  password: string;
  orgCode: string;
}

/**
 * Contrat de POST /api/v1/auth/login (LoginResponse de TIS-CORE, IAM 31).
 * En portée ORGANIZATION, spaceId et userId sont absents de la réponse :
 * le user local est une réalité de space.
 */
export interface LoginSession {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scopeLevel: string;
  organizationId: string;
  accountId: string;
  spaceId?: string;
  userId?: string;
}

/**
 * Session active côté UI : la réponse de login enrichie du contexte
 * saisi au formulaire, pour afficher des codes lisibles plutôt que des UUID.
 */
export interface ActiveSession extends LoginSession {
  orgCode: string;
  email: string;
}

/** Claims situés du token humain TAKIBO (signé par TAS). */
export interface TakiboTokenClaims {
  sub?: string;
  exp?: number;
  subject_type?: string;
  auth_method?: string;
  takibo_scope_level?: string;
  org_id?: string;
  space_id?: string;
  account_id?: string;
  user_id?: string;
  roles?: string[];
  groups?: string[];
  permissions?: string[];
}
