import { LogOut } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import { Alert } from '@/design-system/components/Alert';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { decodeTokenClaims } from '@/shared/security/jwt';
import { useSession } from '@/shared/security/session-context';

function ClaimRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="font-mono text-sm text-text">{children}</dd>
    </div>
  );
}

function ChipList({ label, values }: { label: string; values: string[] | undefined }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-text">{label}</h2>
      {values && values.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {values.map((value) => (
            <li
              key={value}
              className="rounded-sm border border-border bg-surface px-2.5 py-1 font-mono text-xs text-text"
            >
              {value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">Aucun.</p>
      )}
    </section>
  );
}

/**
 * Écran de preuve de la première connexion réelle (récit 01.5) :
 * montre le pouvoir effectif rendu par le token situé — qui, où, avec
 * quels rôles, groupes et permissions. Sera remplacé par la console.
 */
export function SessionPage() {
  const { session, closeSession } = useSession();
  const navigate = useNavigate();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const claims = decodeTokenClaims(session.accessToken);
  const expiresAt = claims?.exp ? new Date(claims.exp * 1000).toLocaleString('fr-CA') : null;

  return (
    <div className="w-full max-w-2xl">
      <Card className="px-6 py-8 sm:px-10 sm:py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-text">Connexion réussie</h1>
          <p className="mt-2 text-sm text-text-muted">
            Voici le pouvoir effectif que TAKIBO vous reconnaît dans ce space.
          </p>
        </header>

        <Alert variant="info" className="mb-6">
          Session provisoire gardée en mémoire (récit 01.5) : un rafraîchissement de page la
          termine. La session durable arrivera avec le BFF (récit TAKIBO UI 02).
        </Alert>

        <dl className="mb-6 flex flex-col gap-2 border-b border-border/60 pb-6">
          <ClaimRow label="Sujet">
            {claims?.subject_type ?? '—'} · {claims?.auth_method ?? '—'}
          </ClaimRow>
          <ClaimRow label="Portée">{session.scopeLevel}</ClaimRow>
          <ClaimRow label="Organisation">{session.organizationId}</ClaimRow>
          <ClaimRow label="Space">{session.spaceId}</ClaimRow>
          <ClaimRow label="Compte">{session.accountId}</ClaimRow>
          <ClaimRow label="Utilisateur">{session.userId}</ClaimRow>
          {expiresAt && <ClaimRow label="Expire le">{expiresAt}</ClaimRow>}
        </dl>

        <div className="mb-8 flex flex-col gap-5">
          <ChipList label="Rôles" values={claims?.roles} />
          <ChipList label="Groupes" values={claims?.groups} />
          <ChipList label="Permissions" values={claims?.permissions} />
        </div>

        <Button
          onClick={() => {
            closeSession();
            void navigate('/login');
          }}
          variant="ghost"
          className="border border-border"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Se déconnecter
        </Button>
      </Card>
    </div>
  );
}
