import { Activity, ArrowRight, Building2, Layers, Plus, ShieldCheck } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Card } from '@/design-system/components/Card';
import { EmptyState } from '@/design-system/components/EmptyState';
import { SpaceStatusPill } from '@/features/organization/components/SpaceStatusPill';
import { demoSpaces } from '@/shared/demo/demo';
import { useIdentity } from '@/shared/identity/useIdentity';

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: IconType;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="flex items-center gap-4 px-5 py-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-wide text-text-muted">{label}</span>
        <span className="block truncate text-lg font-semibold text-text">{value}</span>
        <span className="block truncate text-xs text-text-muted">{detail}</span>
      </span>
    </Card>
  );
}

function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: IconType;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors duration-150 hover:border-primary/50 hover:bg-primary/5"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/12 text-primary">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text">{label}</span>
        <span className="block truncate text-xs text-text-muted">{description}</span>
      </span>
      <ArrowRight className="size-4 text-text-muted" aria-hidden="true" />
    </button>
  );
}

function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-text">{children}</h2>
      {action}
    </div>
  );
}

export function OrgDashboardPage() {
  const { user, organization, orgRole } = useIdentity();
  const navigate = useNavigate();
  const activeSpaces = demoSpaces.filter((space) => space.status === 'ACTIVE').length;
  const preview = demoSpaces.slice(0, 3);

  return (
    <div className="flex flex-col gap-7">
      <header>
        <h1 className="text-2xl font-bold text-text">Bienvenue, {user.name} 👋</h1>
        <p className="mt-1 text-sm text-text-muted">
          Vue d’ensemble de votre organisation : {organization.name}
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Organisation" value={organization.name} detail={organization.domain} />
        <StatCard icon={ShieldCheck} label="Mon rôle" value={orgRole} detail="Portée : Organisation" />
        <StatCard
          icon={Layers}
          label="Spaces"
          value={String(demoSpaces.length)}
          detail={`${activeSpaces} actifs`}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <SectionTitle
            action={
              <Link to="/app/my-spaces" className="text-xs font-medium text-primary hover:underline">
                Voir tous mes Spaces
              </Link>
            }
          >
            Mes Spaces
          </SectionTitle>
          <ul className="flex flex-col divide-y divide-border">
            {preview.map((space) => (
              <li key={space.id} className="flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Layers className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text">{space.name}</span>
                  <span className="block truncate text-xs text-text-muted">
                    {space.code} · {space.role}
                  </span>
                </span>
                <SpaceStatusPill status={space.status} />
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <SectionTitle>Accès rapides</SectionTitle>
            <div className="flex flex-col gap-2.5">
              <QuickAction
                icon={Plus}
                label="Créer un Space"
                description="Ajouter un espace à l’organisation"
                onClick={() => navigate('/app/spaces')}
              />
              <QuickAction
                icon={Layers}
                label="Mes Spaces"
                description="Ouvrir un espace accessible"
                onClick={() => navigate('/app/my-spaces')}
              />
              <QuickAction
                icon={Building2}
                label="Gestion des Spaces"
                description="Tous les espaces de l’organisation"
                onClick={() => navigate('/app/spaces')}
              />
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle>Activité de l’organisation</SectionTitle>
            <EmptyState
              icon={Activity}
              title="Bientôt"
              description="Les courbes d’activité et l’audit arriveront lorsque leur lecture sera exposée par le backend."
            />
          </Card>
        </div>
      </section>

      <p className="text-center text-xs text-text-muted">
        Récit UI 01 — socle graphique. Les données affichées sont des exemples de démonstration,
        pas encore issues de TAKIBO.
      </p>
    </div>
  );
}
