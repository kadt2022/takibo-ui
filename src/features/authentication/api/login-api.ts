import type { LoginCredentials, LoginSession } from '@/features/authentication/model/login';

/**
 * Erreur de connexion portant un message destiné à l'utilisateur.
 * Aucun détail technique du backend n'est exposé, et le message ne révèle
 * jamais si une adresse courriel existe (doctrine anti-énumération).
 */
export class LoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoginError';
  }
}

function messageForStatus(status: number): string {
  switch (status) {
    case 400:
    case 401:
      return 'Identifiants invalides.';
    case 403:
      return 'Connexion refusée : ce compte ne peut pas accéder à ce space.';
    case 404:
      return 'Organisation ou space introuvable.';
    default:
      return 'Connexion impossible pour le moment. Veuillez réessayer.';
  }
}

/**
 * Login humain situé contre TIS-CORE (récit 01.5, mode direct provisoire).
 * En dev, /api est relayé vers takibo-iam-boot par le proxy Vite.
 *
 * Règles de sécurité : les identifiants ne sont jamais journalisés, jamais
 * placés dans une URL ; le token rendu ne doit jamais être persisté dans le
 * navigateur (session en mémoire uniquement, jusqu'au BFF du récit 02).
 */
export async function authenticate(credentials: LoginCredentials): Promise<LoginSession> {
  let response: Response;
  try {
    response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new LoginError('Le service TAKIBO est injoignable. Vérifiez que le backend est démarré.');
  }

  if (!response.ok) {
    throw new LoginError(messageForStatus(response.status));
  }

  return (await response.json()) as LoginSession;
}
