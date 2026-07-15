import { Bell, ChevronDown, FlaskConical, Menu, Moon, Search, Sun } from 'lucide-react';

import { ContextBadge } from '@/layouts/AppShell/ContextBadge';
import { useIdentity } from '@/shared/identity/useIdentity';
import { useTheme } from '@/shared/theme/useTheme';

interface TopBarProps {
  onOpenMenu: () => void;
}

export function TopBar({ onOpenMenu }: TopBarProps) {
  const { user, orgRole, context } = useIdentity();
  const { theme, toggle } = useTheme();

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
        <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span
          className="hidden items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning sm:inline-flex"
          title="Récit UI 01 : le shell tourne sur des données de démonstration, sans backend."
        >
          <FlaskConical className="size-3.5" aria-hidden="true" />
          Démonstration
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
          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-danger text-[9px] font-bold text-white">
            5
          </span>
        </button>

        <div className="flex items-center gap-2.5 rounded-full border border-border py-1 pl-1 pr-2.5">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-on-primary">
            {user.initials}
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-medium text-text">{user.name}</span>
            <span className="block text-xs text-text-muted">{orgRole}</span>
          </span>
          <ChevronDown className="size-4 text-text-muted" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
