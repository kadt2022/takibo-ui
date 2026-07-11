export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Issue possible d'une tentative de connexion.
 * Tant que le BFF n'existe pas (récit TAKIBO UI 02+), la seule issue
 * possible est `service-not-connected` : aucune session n'est créée.
 */
export type LoginOutcome = { status: 'service-not-connected' };
