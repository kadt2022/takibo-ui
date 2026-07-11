import { Outlet } from 'react-router-dom';

import { Logo } from '@/design-system/components/Logo';
import { BoundaryMotif } from '@/design-system/foundations/BoundaryMotif';

const doctrine = [
  'Une identité souveraine.',
  'Un accès situé.',
  'Une confiance vérifiable.',
] as const;

const principles = [
  'Toute frontière est réelle.',
  'Tout contexte compte.',
  'Tout accès laisse une trace.',
] as const;

/**
 * Layout des pages publiques d'authentification.
 * Deux zones : la marque (doctrine TAKIBO, motif de frontières) et l'action
 * (formulaire). Sur mobile, la marque se replie en un en-tête compact.
 */
export function AuthenticationLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Zone de marque */}
      <section
        aria-label="TAKIBO — Identity, Access and Context"
        className="relative hidden overflow-hidden border-r border-border/60 bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12"
      >
        <BoundaryMotif className="absolute -left-56 top-1/2 h-[52rem] w-[52rem] -translate-y-1/2 text-border" />

        <header className="relative">
          <Logo size={44} withWordmark />
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-text-muted">
            Identity, Access and Context
          </p>
        </header>

        <div className="relative max-w-md">
          {doctrine.map((line) => (
            <p key={line} className="text-3xl font-semibold leading-snug text-text">
              {line}
            </p>
          ))}
        </div>

        <footer className="relative flex flex-wrap gap-x-6 gap-y-1">
          {principles.map((line) => (
            <span key={line} className="text-xs tracking-wide text-text-muted">
              {line}
            </span>
          ))}
        </footer>
      </section>

      {/* Zone de connexion */}
      <main className="flex flex-col px-6 py-8 sm:px-10">
        <header className="mb-10 lg:hidden">
          <Logo size={36} withWordmark />
        </header>

        <div className="flex flex-1 items-center justify-center">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
