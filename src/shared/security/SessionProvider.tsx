import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { ActiveSession } from '@/features/authentication/model/login';
import { SessionContext } from '@/shared/security/session-context';

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * Porte la session TAKIBO en mémoire React uniquement (récit 01.5) :
 * ni localStorage, ni sessionStorage, ni cookie posé par le frontend.
 * Un rafraîchissement de page perd volontairement la session — le BFF
 * (récit TAKIBO UI 02) apportera la session durable côté serveur.
 */
export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<ActiveSession | null>(null);

  const state = useMemo(
    () => ({
      session,
      openSession: (next: ActiveSession) => setSession(next),
      closeSession: () => setSession(null),
    }),
    [session],
  );

  return <SessionContext.Provider value={state}>{children}</SessionContext.Provider>;
}
