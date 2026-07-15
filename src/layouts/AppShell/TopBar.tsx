import { Bell, LogOut, Menu, Moon, Search, Sun, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ContextBadge } from '@/layouts/AppShell/ContextBadge';
import { useIdentity } from '@/shared/identity/useIdentity';
import { useSession } from '@/shared/security/session-context';
import { useTheme } from '@/shared/theme/useTheme';

interface TopBarProps {
  onOpenMenu: () => void;
}

/** Heure d'expiration de la preuve, dérivée purement de expiresAt. */
function formatExpiry(expiresAt: number): string {
  return new Date(expiresAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function TopBar({ onOpenMenu }: TopBarProps) {
  const { email, roleLabel, roleCode, orgCode, organizationId, avatarInitial, context, expiresAt } =
    useIdentity();
  const { closeSession } = useSession();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

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

      <ContextBadge scope={context} />

      <div className="ml-1 hidden max-w-md flex-1 items-center gap-2 rounded-full border border-border bg-background/50 px-3.5 py-2 text-sm text-text-muted md:flex">
        <Search className="size-4" aria-hidden="true" />
        <span>Rechercher…</span>
        <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span
          className="hidden items-center gap-1.5 rounded-full border border-border bg-background/50 px-2.5 py-1 text-[11px] text-text-muted lg:inline-flex"
          title="Heure d’expiration de la preuve de session."
        >
          <Timer className="size-3.5" aria-hidden="true" />
          Session jusqu’à {formatExpiry(expiresAt)}
        </span>

        <button
          type="button"
          onClick={toggle}
          className="grid size-9 place-items-center rounded-md border border-border text-text-muted hover:text-text"
          aria-label={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
        >
          {theme === 'dark' ? (
            <Sun className="size-[18px]" aria-hidden="true" />
          ) : (
            <Moon className="size-[18px]" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          className="relative grid size-9 place-items-center rounded-md border border-border text-text-muted hover:text-text"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" aria-hidden="true" />
        </button>

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
