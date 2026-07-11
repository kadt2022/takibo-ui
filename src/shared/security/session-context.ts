import { createContext, useContext } from 'react';

import type { LoginSession } from '@/features/authentication/model/login';

export interface SessionState {
  /** Session courante, gardée en mémoire uniquement (jamais persistée). */
  session: LoginSession | null;
  openSession: (session: LoginSession) => void;
  closeSession: () => void;
}

export const SessionContext = createContext<SessionState | null>(null);

export function useSession(): SessionState {
  const state = useContext(SessionContext);
  if (!state) {
    throw new Error('useSession doit être utilisé sous SessionProvider.');
  }
  return state;
}
