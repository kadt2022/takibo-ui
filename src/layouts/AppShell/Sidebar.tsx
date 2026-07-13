import { Building2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Logo } from '@/design-system/components/Logo';
import { organizationNav } from '@/layouts/AppShell/menu';
import { useIdentity } from '@/shared/identity/useIdentity';
import { cn } from '@/shared/utilities/cn';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed, onNavigate }: SidebarProps) {
  const { user, organization } = useIdentity();

  return (
    <div className="flex h-full flex-col gap-5 bg-surface p-3">
      {/* Marque */}
      <div className={cn('flex items-center px-2 pt-1', collapsed ? 'justify-center' : 'gap-2')}>
        <Logo size={30} withWordmark={!collapsed} />
      </div>

      {/* Organisation courante (une seule — pas un sélecteur multi-org) */}
      <div
        className={cn(
          'flex items-center gap-3 rounded-md border border-border bg-background/40 p-2.5',
          collapsed && 'justify-center',
        )}
        title={`${organization.name} · ${organization.domain}`}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/12 text-primary">
          <Building2 className="size-4" aria-hidden="true" />
        </span>
        {!collapsed && (
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold text-text">{organization.name}</span>
            <span className="block truncate text-xs text-text-muted">{organization.domain}</span>
          </span>
        )}
      </div>

      {/* Navigation du contexte ORGANISATION */}
      <nav className="flex flex-1 flex-col gap-1">
        {!collapsed && (
          <span className="px-2 pb-1 text-[10px] uppercase tracking-[0.16em] text-text-muted">
            Organisation
          </span>
        )}
        {organizationNav.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors duration-150',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-primary/12 font-medium text-primary'
                  : 'text-text-muted hover:bg-background/60 hover:text-text',
              )
            }
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Pied : identité + repli */}
      <div className="flex flex-col gap-1 border-t border-border pt-3">
        <div className={cn('flex items-center gap-3 rounded-md px-2 py-1.5', collapsed && 'justify-center')}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-on-primary">
            {user.initials}
          </span>
          {!collapsed && (
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-medium text-text">{user.name}</span>
              <span className="block truncate text-xs text-text-muted">{organization.name}</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-text-muted transition-colors duration-150 hover:bg-background/60 hover:text-text',
            collapsed && 'justify-center',
          )}
          aria-label={collapsed ? 'Déployer le menu' : 'Réduire le menu'}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[18px]" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-[18px]" aria-hidden="true" />
          )}
          {!collapsed && <span>Réduire le menu</span>}
        </button>
      </div>
    </div>
  );
}
