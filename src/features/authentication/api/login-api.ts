import type { LoginCredentials, LoginOutcome } from '@/features/authentication/model/login';

/**
 * Point d'entrée de l'authentification côté frontend.
 *
 * Le récit TAKIBO UI 01 ne connecte pas encore le formulaire au backend :
 * cette fonction simule uniquement la latence réseau afin d'exercer l'état
 * de chargement, puis répond honnêtement que le service n'est pas connecté.
 * Elle sera remplacée par l'appel au BFF Spring Boot (récit TAKIBO UI 02).
 *
 * Règle de sécurité : les identifiants ne sont jamais journalisés, jamais
 * placés dans une URL, jamais stockés dans le navigateur.
 */
export async function authenticate(_credentials: LoginCredentials): Promise<LoginOutcome> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return { status: 'service-not-connected' };
}
