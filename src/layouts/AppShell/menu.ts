import { Building2, LayoutDashboard, Layers, Settings } from 'lucide-react';
import type { ComponentType } from 'react';

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
}

/**
 * Onglets du contexte ORGANISATION (récit UI 01 — périmètre volontairement
 * minimal). Le contexte SPACE aura son propre menu au récit UI 05, après
 * l'échange de token (IAM 33). Aucun menu PLATEFORME dans cette console.
 */
export const organizationNav: NavItem[] = [
  { label: 'Tableau de bord', to: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Mes Spaces', to: '/app/my-spaces', icon: Layers },
  { label: 'Gestion des Spaces', to: '/app/spaces', icon: Building2 },
  { label: 'Paramètres', to: '/app/settings', icon: Settings },
];
