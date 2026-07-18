import {
  Building2,
  LayoutDashboard,
  Layers,
  Settings,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import type { ComponentType } from 'react';

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  /** Réservé à l'autorité d'organisation (R_ORG_OWNER / R_ORG_ADMIN). */
  orgAdminOnly?: boolean;
}

/**
 * Onglets du contexte ORGANISATION. « Gestion des Spaces » n'apparaît que pour
 * l'autorité ORG (récit UI 03) : un membre ou un R_SPACE_ADMIN seul ne voit pas
 * l'inventaire administratif. « Rôles » et « Groupes » suivent la même règle
 * (le catalogue RBAC exige l'admin tenant) ; leurs pages arriveront avec leurs
 * récits — d'ici là, la route tombe sur « Page introuvable ». Le contexte SPACE
 * aura son propre menu à un récit ultérieur, après l'échange de token. Aucun
 * menu PLATEFORME dans cette console.
 */
export const organizationNav: NavItem[] = [
  { label: 'Tableau de bord', to: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Mes Spaces', to: '/app/my-spaces', icon: Layers },
  { label: 'Gestion des Spaces', to: '/app/spaces', icon: Building2, orgAdminOnly: true },
  { label: 'Rôles', to: '/app/roles', icon: ShieldCheck, orgAdminOnly: true },
  { label: 'Groupes', to: '/app/groups', icon: UsersRound, orgAdminOnly: true },
  { label: 'Paramètres', to: '/app/settings', icon: Settings },
];
