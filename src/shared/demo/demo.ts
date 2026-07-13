/*
 * Données de DÉMONSTRATION du récit UI 01 (socle graphique).
 * ---------------------------------------------------------
 * Récit UI 01 : aucun appel backend. Toute donnée affichée par le shell
 * vient d'ici et doit être présentée comme démonstration (badge visible).
 * Le vrai login arrive au récit UI 02, la vraie liste des spaces au récit
 * UI 03 — ils remplaceront cet adapter, pas le shell.
 */

/** Marqueur global : le shell tourne sur des données locales. */
export const IS_DEMO = true;

export type SpaceStatus = 'ACTIVE' | 'SUSPENDED' | 'CREATING' | 'DISABLED';

export interface DemoIdentity {
  user: { name: string; email: string; initials: string };
  organization: { code: string; name: string; domain: string };
  /** Rôle organisationnel lisible (démo). Le vrai rôle viendra des claims (UI 02). */
  orgRole: string;
  /** Portée du contexte courant. UI 01 reste en ORGANIZATION. */
  context: 'ORGANIZATION';
}

export interface DemoSpace {
  id: string;
  code: string;
  name: string;
  status: SpaceStatus;
  /** Statut du user local dans ce space (démo). */
  membershipStatus: 'ACTIVE' | 'SUSPENDED';
  /** Rôle du compte dans ce space (démo — non fourni par /me/spaces à ce stade). */
  role: string;
  /** Nombre d'utilisateurs (démo — pas d'agrégat backend). */
  users: number;
  /** Le space peut-il être ouvert ? (miroir du futur `selectable` de /me/spaces) */
  selectable: boolean;
}

export const demoIdentity: DemoIdentity = {
  user: { name: 'John Doe', email: 'john.doe@acme.com', initials: 'JD' },
  organization: { code: 'acme', name: 'ACME Corporation', domain: 'acme.com' },
  orgRole: 'Org Admin',
  context: 'ORGANIZATION',
};

export const demoSpaces: DemoSpace[] = [
  { id: 's-finance', code: 'finance', name: 'Finance', status: 'ACTIVE', membershipStatus: 'ACTIVE', role: 'Space Admin', users: 128, selectable: true },
  { id: 's-marketing', code: 'marketing', name: 'Marketing', status: 'ACTIVE', membershipStatus: 'ACTIVE', role: 'Membre', users: 87, selectable: true },
  { id: 's-rnd', code: 'rnd', name: 'R&D', status: 'ACTIVE', membershipStatus: 'ACTIVE', role: 'Membre', users: 42, selectable: true },
  { id: 's-support', code: 'support', name: 'Support', status: 'SUSPENDED', membershipStatus: 'ACTIVE', role: 'Membre', users: 22, selectable: false },
];
