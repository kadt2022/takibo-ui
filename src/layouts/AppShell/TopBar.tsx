import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useIdentity } from '@/shared/identity/useIdentity';
import { useSession } from '@/shared/security/session-context';

interface TopBarProps {
  onOpenMenu: () => void;
}

/**
 * Barre supérieure volontairement minimale : l'identité réelle de la session
 * et la déconnexion, rien d'autre. Le contexte est porté par le sélecteur de
 * la Sidebar ; recherche, notifications et minuteur de session ont été retirés
 * tant qu'ils ne sont pas branchés sur de vraies surfaces.
 */
export function TopBar({ onOpenMenu }: TopBarProps) {
  const { email, roleLabel, roleCode, orgCode, organizationId, avatarInitial } = useIdentity();
  const { closeSession } = useSession();
  const navigate = useNavigate();

  const logout = () => {
    closeSession();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        className="grid size-9 place-items-center rounded-md border border-border text-text-muted hover:text-text lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-[18px]" aria-hidden="true" />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <div
          className="flex items-center gap-2.5 rounded-full border border-border py-1 pl-1 pr-2.5"
          title={`${roleCode ?? 'sans rôle'} · organisation ${orgCode} (${organizationId})`}
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-on-primary">
            {avatarInitial}
          </span>
          <span className="hidden max-w-[180px] leading-tight sm:block">
            <span className="block truncate text-sm font-medium text-text">{email}</span>
            <span className="block truncate text-xs text-text-muted">{roleLabel}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="grid size-9 place-items-center rounded-md border border-border text-text-muted hover:text-text"
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <LogOut className="size-[18px]" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
