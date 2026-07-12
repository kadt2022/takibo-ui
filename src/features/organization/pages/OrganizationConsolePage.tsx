import {
  Building2,
  Clock3,
  IdCard,
  KeyRound,
  Layers,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import type { ComponentType, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Alert } from '@/design-system/components/Alert';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Logo } from '@/design-system/components/Logo';
import { Spinner } from '@/design-system/components/Spinner';
import { BoundaryMotif } from '@/design-system/foundations/BoundaryMotif';
import { fetchOrganizationSpaces } from '@/features/organization/api/spaces-api';
import { decodeTokenClaims } from '@/shared/security/jwt';
import { useSession } from '@/shared/security/session-context';
import { cn } from '@/shared/utilities/cn';

type IconType = ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;

function shortId(id: string): string {
  return `${id.slice(0, 8)}…`;
}

/** Compte à rebours d'expiration du token — tout accès est provisoire. */
function useRemainingSeconds(expiresAtMs: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (expiresAtMs === null) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAtMs]);

  if (expiresAtMs === null) {
    return null;
  }
  return Math.max(0, Math.floor((expiresAtMs - now) / 1000));
}

function Badge({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'ember' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs',
        tone === 'ember'
          ? 'border-primary/50 bg-primary/10 text-primary'
          : 'border-border bg-surface text-text-muted',
      )}
    >
      {children}
    </span>
  );
}

function ContextCard({
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
    <Card className="px-5 py-4">
      <div className="flex items-center gap-2 text-text-muted">
        <Icon className="size-4" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 truncate text-lg font-semibold text-text" title={value}>
        {value}
      </p>
      <p className="mt-1 truncate font-mono text-xs text-text-muted/70" title={detail}>
        {detail}
      </p>
    </Card>
  );
}

function PowerCard({
  icon: Icon,
  label,
  values,
  accent = false,
}: {
  icon: IconType;
  label: string;
  values: string[] | undefined;
  accent?: boolean;
}) {
  return (
    <Card className="px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            className={cn('size-4', accent ? 'text-primary' : 'text-text-muted')}
            aria-hidden="true"
          />
          <h2 className="text-sm font-semibold text-text">{label}</h2>
        </div>
        <span className="font-mono text-xs text-text-muted">{values?.length ?? 0}</span>
      </div>
      {values && values.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <li
              key={value}
              className={cn(
                'rounded-sm border px-2 py-0.5 font-mono text-xs',
                accent
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border bg-surface text-text',
              )}
            >
              {value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">Aucun.</p>
      )}
    </Card>
  );
}

const spaceStatusStyles: Record<string, string> = {
  ACTIVE: 'border-success/40 bg-success/10 text-success',
  SUSPENDED: 'border-warning/40 bg-warning/10 text-warning',
};

function SpaceCard({ code, name, status }: { code: string; name: string; status: string }) {
  return (
    <Card className="flex flex-col gap-3 px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-text" title={name}>
            {name}
          </p>
          <p className="truncate font-mono text-xs text-text-muted" title={code}>
            {code}
          </p>
        </div>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 font-mono text-xs',
            spaceStatusStyles[status] ?? 'border-border bg-surface text-text-muted',
          )}
        >
          {status}
        </span>
      </div>
      <Button
        variant="ghost"
        disabled
        title="L'entrée en space (échange de contexte) arrive avec le récit IAM 33."
        className="h-9 border border-border text-xs"
      >
        Entrer — récit IAM 33
      </Button>
    </Card>
  );
}

/**
 * Console Organisation (embryon, récit UI 01.6) : le contexte organisationnel
 * de la session, le pouvoir effectif ORG rendu par le token, et les spaces de
 * l'organisation. L'entrée dans un space viendra avec l'échange de contexte
 * (IAM 33) ; la liste personnelle d'un compte sans autorité, avec IAM 32.
 */
export function OrganizationConsolePage() {
  const { session, closeSession } = useSession();
  const navigate = useNavigate();
  const claims = session ? decodeTokenClaims(session.accessToken) : null;
  const expiresAtMs = claims?.exp ? claims.exp * 1000 : null;
  const remaining = useRemainingSeconds(expiresAtMs);

  const spacesQuery = useQuery({
    queryKey: ['organization-spaces', session?.organizationId],
    queryFn: () => fetchOrganizationSpaces(session!),
    enabled: session !== null,
  });

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const username = session.email.split('@')[0] ?? session.email;
  const countdown =
    remaining === null
      ? null
      : remaining <= 0
        ? 'Session expirée'
        : `Expire dans ${Math.floor(remaining / 60)} min ${String(remaining % 60).padStart(2, '0')} s`;

  const logout = () => {
    closeSession();
    void navigate('/login');
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <BoundaryMotif className="pointer-events-none absolute -right-64 -top-64 h-[42rem] w-[42rem] text-border/50" />

      <header className="relative border-b border-border/60 bg-surface/60 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-4">
            <Logo size={30} withWordmark />
            <span className="hidden rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-text-muted md:inline">
              {session.orgCode}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="hidden font-mono text-xs text-text-muted sm:inline"
              title={session.email}
            >
              {session.email}
            </span>
            <Button
              variant="ghost"
              onClick={logout}
              className="h-9 border border-border px-3 text-xs"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-6 py-10">
        <section className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-primary">Console Organisation</p>
            <h1 className="mt-2 text-3xl font-bold text-text">Bienvenue, {username}</h1>
            <p className="mt-2 max-w-xl text-sm text-text-muted">
              L'organisation vous identifie ; le space situera votre action. Voici votre pouvoir
              organisationnel — rien de plus, rien de moins, et rien d'acquis.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{claims?.subject_type ?? 'HUMAN'}</Badge>
            <Badge>{claims?.auth_method ?? 'PASSWORD'}</Badge>
            <Badge>Portée {session.scopeLevel}</Badge>
            {countdown && (
              <Badge tone="ember">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {countdown}
              </Badge>
            )}
          </div>
        </section>

        <section
          aria-label="Contexte de la session"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <ContextCard
            icon={Building2}
            label="Organisation"
            value={session.orgCode}
            detail={shortId(session.organizationId)}
          />
          <ContextCard
            icon={IdCard}
            label="Compte"
            value={session.email}
            detail={shortId(session.accountId)}
          />
        </section>

        <section aria-label="Vos spaces" className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Layers className="size-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-text">Les spaces de l'organisation</h2>
          </div>

          {spacesQuery.isPending && (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Spinner /> Chargement des spaces…
            </div>
          )}

          {spacesQuery.data?.kind === 'ok' &&
            (spacesQuery.data.spaces.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {spacesQuery.data.spaces.map((space) => (
                  <SpaceCard
                    key={space.id}
                    code={space.code}
                    name={space.name}
                    status={space.status}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Aucun space dans cette organisation.</p>
            ))}

          {spacesQuery.data?.kind === 'no-authority' && (
            <Alert variant="info">
              Cette liste administrative exige une autorité d'organisation. Votre liste personnelle
              de spaces accessibles arrivera avec le récit IAM 32.
            </Alert>
          )}

          {spacesQuery.isError && (
            <Alert variant="danger">Impossible de consulter les spaces pour le moment.</Alert>
          )}
        </section>

        <section aria-label="Pouvoir effectif" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <PowerCard icon={ShieldCheck} label="Rôles" values={claims?.roles} accent />
          <PowerCard icon={Users} label="Groupes" values={claims?.groups} />
          <PowerCard icon={KeyRound} label="Permissions" values={claims?.permissions} />
        </section>

        <p className="mt-10 text-center text-xs text-text-muted">
          Session provisoire gardée en mémoire (récit UI 01.6) : un rafraîchissement de page la
          termine. La session durable arrivera avec le BFF (récit UI 02).
        </p>
      </main>
    </div>
  );
}
