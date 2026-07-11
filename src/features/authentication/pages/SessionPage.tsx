import {
  Building2,
  Clock3,
  IdCard,
  KeyRound,
  Layers,
  LogOut,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import type { ComponentType, ReactNode } from 'react';

import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Logo } from '@/design-system/components/Logo';
import { BoundaryMotif } from '@/design-system/foundations/BoundaryMotif';
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

/**
 * Accueil post-connexion (récit 01.5) : le contexte situé de la session et
 * le pouvoir effectif rendu par le token signé par TAS. Cet écran deviendra
 * le shell de la console d'administration dans les récits suivants.
 */
export function SessionPage() {
  const { session, closeSession } = useSession();
  const navigate = useNavigate();
  const claims = session ? decodeTokenClaims(session.accessToken) : null;
  const expiresAtMs = claims?.exp ? claims.exp * 1000 : null;
  const remaining = useRemainingSeconds(expiresAtMs);

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
          <Logo size={30} withWordmark />
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
            <p className="text-sm uppercase tracking-[0.25em] text-primary">Connexion réussie</p>
            <h1 className="mt-2 text-3xl font-bold text-text">Bienvenue, {username}</h1>
            <p className="mt-2 max-w-xl text-sm text-text-muted">
              Voici le pouvoir effectif que TAKIBO vous reconnaît dans ce space. Rien de plus, rien
              de moins — et rien d'acquis.
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
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <ContextCard
            icon={Building2}
            label="Organisation"
            value={session.orgCode}
            detail={shortId(session.organizationId)}
          />
          <ContextCard
            icon={Layers}
            label="Space"
            value={session.spaceCode}
            detail={shortId(session.spaceId)}
          />
          <ContextCard
            icon={IdCard}
            label="Compte"
            value={session.email}
            detail={shortId(session.accountId)}
          />
          <ContextCard
            icon={UserRound}
            label="Utilisateur"
            value={username}
            detail={shortId(session.userId)}
          />
        </section>

        <section aria-label="Pouvoir effectif" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <PowerCard icon={ShieldCheck} label="Rôles" values={claims?.roles} accent />
          <PowerCard icon={Users} label="Groupes" values={claims?.groups} />
          <PowerCard icon={KeyRound} label="Permissions" values={claims?.permissions} />
        </section>

        <p className="mt-10 text-center text-xs text-text-muted">
          Session provisoire gardée en mémoire (récit 01.5) : un rafraîchissement de page la
          termine. La session durable arrivera avec le BFF (récit TAKIBO UI 02).
        </p>
      </main>
    </div>
  );
}
