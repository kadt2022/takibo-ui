import { demoIdentity } from '@/shared/demo/demo';
import type { DemoIdentity } from '@/shared/demo/demo';

/**
 * Identité de l'acteur courant lue par le shell.
 *
 * Récit UI 01 : renvoie l'identité de démonstration. C'est la couture unique
 * par laquelle le récit UI 02 branchera la vraie session (claims du token
 * ORGANIZATION) sans toucher au shell qui la consomme.
 */
export function useIdentity(): DemoIdentity {
  return demoIdentity;
}
