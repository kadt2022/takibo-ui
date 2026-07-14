import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronRight,
  KeyRound,
  Layers,
  Plus,
  ScrollText,
  ShieldCheck,
  TrendingUp,
  Trash2,
  TriangleAlert,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Card } from '@/design-system/components/Card';
import { ActivityChart } from '@/features/organization/components/ActivityChart';
import { DonutChart } from '@/features/organization/components/DonutChart';
import { SpaceStatusPill } from '@/features/organization/components/SpaceStatusPill';
import {
  demoActivity,
  demoAccessibleSpaces,
  demoKpis,
  demoNotifications,
  demoRecentActivities,
  demoRoleDistribution,
  demoSpaceStatusDistribution,
} from '@/shared/demo/demo';
import type { ActivitySeverity, DemoKpi, NotificationSeverity } from '@/shared/demo/demo';
import { useIdentity } from '@/shared/identity/useIdentity';
import { cn } from '@/shared/utilities/cn';

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;

const kpiIcons: Record<DemoKpi['icon'], IconType> = {
  users: Users,
  shield: ShieldCheck,
  groups: UsersRound,
  layers: Layers,
  key: KeyRound,
};

const activityIcons: Record<string, IconType> = {
  'user-plus': UserPlus,
  shield: ShieldCheck,
  key: KeyRound,
  alert: TriangleAlert,
  trash: Trash2,
};

const severityBadge: Record<ActivitySeverity, { label: string; className: string }> = {
  success: { label: 'Succès', className: 'border-success/40 bg-success/10 text-success' },
  warning: { label: 'Avertissement', className: 'border-warning/40 bg-warning/10 text-warning' },
  error: { label: 'Erreur', className: 'border-danger/40 bg-danger/10 text-danger' },
};

const notificationDot: Record<NotificationSeverity, string> = {
  high: 'bg-danger',
  medium: 'bg-warning',
  low: 'bg-primary',
};

function PanelHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold text-text">{title}</h2>
      {action}
    </div>
  );
}

function KpiTile({ kpi }: { kpi: DemoKpi }) {
  const Icon = kpiIcons[kpi.icon];
  return (
    <Card className="flex items-start gap-4 p-5">
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-text-muted">{kpi.label}</p>
        <p className="mt-0.5 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold tabular-nums text-text">{kpi.value}</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-success">
            <TrendingUp className="size-3" aria-hidden="true" />
            {kpi.trend}%
          </span>
        </p>
        <p className="mt-0.5 text-xs text-text-muted">vs période précédente</p>
      </div>
    </Card>
  );
}

function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  disabled = false,
}: {
  icon: IconType;
  label: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-lg border border-border px-3.5 py-3 text-left transition-colors duration-150 hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border disabled:hover:bg-transparent"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/12 text-primary">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text">{label}</span>
        <span className="block truncate text-xs text-text-muted">{description}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
    </button>
  );
}

export function OrgDashboardPage() {
  const { user, organization } = useIdentity();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Bienvenue, {user.name} 👋</h1>
          <p className="mt-1 text-sm text-text-muted">
            Vue d’ensemble de votre organisation : {organization.name}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text-muted"
        >
          <Calendar className="size-4" aria-hidden="true" />
          12 mai 2024 – 19 mai 2024
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      </header>

      {/* KPI */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {demoKpis.map((kpi) => (
          <KpiTile key={kpi.key} kpi={kpi} />
        ))}
      </section>

      {/* Graphiques */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr_1fr]">
        <Card className="p-5">
          <PanelHeader
            title="Activité de l’organisation"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-text-muted">
                7 derniers jours
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </span>
            }
          />
          <ActivityChart
            labels={demoActivity.labels}
            series={demoActivity.series}
            maxY={demoActivity.maxY}
          />
        </Card>

        <Card className="p-5">
          <PanelHeader title="Répartition des utilisateurs par rôle" />
          <DonutChart segments={demoRoleDistribution} centerValue={342} centerLabel="Total" />
        </Card>

        <Card className="p-5">
          <PanelHeader title="Statut des Spaces" />
          <DonutChart segments={demoSpaceStatusDistribution} centerValue={7} centerLabel="Total" />
        </Card>
      </section>

      {/* Rangée basse */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Mes Spaces accessibles */}
        <Card className="flex flex-col p-5">
          <PanelHeader title="Mes Spaces accessibles" />
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[380px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-2 pb-2 font-medium">Space</th>
                  <th className="px-2 pb-2 font-medium">Statut</th>
                  <th className="px-2 pb-2 font-medium">Rôle</th>
                  <th className="px-2 pb-2 text-right font-medium">Users</th>
                  <th className="px-2 pb-2" />
                </tr>
              </thead>
              <tbody>
                {demoAccessibleSpaces.map((space) => (
                  <tr key={space.id} className="border-t border-border">
                    <td className="px-2 py-3">
                      <span className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                          <Layers className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-text">{space.name}</span>
                          <span className="block truncate text-xs text-text-muted">
                            {space.code}.{organization.domain}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      <SpaceStatusPill status={space.status} />
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={cn(
                          'text-xs font-medium',
                          space.role === 'Space Admin' ? 'text-primary' : 'text-text-muted',
                        )}
                      >
                        {space.role}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right font-mono tabular-nums text-text-muted">
                      {space.users}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <ChevronRight className="ml-auto size-4 text-text-muted" aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link
            to="/app/my-spaces"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Voir tous mes Spaces
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Card>

        {/* Activités récentes */}
        <Card className="p-5">
          <PanelHeader
            title="Activités récentes"
            action={
              <button type="button" className="text-xs font-medium text-primary hover:underline">
                Voir tout
              </button>
            }
          />
          <ul className="flex flex-col divide-y divide-border">
            {demoRecentActivities.map((item) => {
              const Icon = activityIcons[item.icon] ?? ShieldCheck;
              const badge = severityBadge[item.severity];
              return (
                <li key={item.id} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background/40 text-text-muted">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-text">{item.title}</span>
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-text-muted">{item.detail}</span>
                      <span className="shrink-0 text-[11px] text-text-muted">{item.time}</span>
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Accès rapides + Notifications */}
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <PanelHeader title="Accès rapides" />
            <div className="flex flex-col gap-2.5">
              <QuickAction
                icon={Plus}
                label="Créer un Space"
                description="Ajouter un nouvel espace à l’organisation"
                disabled
              />
              <QuickAction
                icon={UserPlus}
                label="Inviter un utilisateur"
                description="Inviter dans un espace de l’organisation"
                onClick={() => navigate('/app/invitations')}
              />
              <QuickAction
                icon={ShieldCheck}
                label="Gérer les rôles"
                description="Rôles et autorités de l’organisation"
                onClick={() => navigate('/app/roles')}
              />
              <QuickAction
                icon={ScrollText}
                label="Voir l’audit"
                description="Journaux d’activité de l’organisation"
                onClick={() => navigate('/app/audit')}
              />
            </div>
          </Card>

          <Card className="p-5">
            <PanelHeader
              title="Notifications"
              action={
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Voir tout
                </button>
              }
            />
            <ul className="flex flex-col divide-y divide-border">
              {demoNotifications.map((notif) => (
                <li key={notif.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className={cn('size-2 shrink-0 rounded-full', notificationDot[notif.severity])}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-text">{notif.title}</span>
                  <span className="shrink-0 text-[11px] text-text-muted">{notif.time}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <p className="text-center text-xs text-text-muted">
        Récit UI 01 — les données de ce tableau de bord sont des exemples de démonstration, pas
        encore issues de TAKIBO.
      </p>
    </div>
  );
}
