export interface LoginCredentials {
  email: string;
  password: string;
  orgCode: string;
  spaceCode: string;
}

/** Contrat de POST /api/v1/auth/login (LoginResponse de TIS-CORE). */
export interface LoginSession {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scopeLevel: string;
  organizationId: string;
  spaceId: string;
  accountId: string;
  userId: string;
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
