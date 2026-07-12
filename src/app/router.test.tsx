import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '@/app/providers';
import { routes } from '@/app/router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

describe('router', () => {
  it('affiche la page de connexion sur /login (AC-03)', async () => {
    renderAt('/login');

    expect(
      await screen.findByRole('heading', { name: 'Bienvenue dans TAKIBO' }),
    ).toBeInTheDocument();
  });

  it('redirige la racine vers /login sans session (AC-04)', async () => {
    const router = renderAt('/');

    expect(
      await screen.findByRole('heading', { name: 'Bienvenue dans TAKIBO' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('protège /org : sans session en mémoire, retour à /login', async () => {
    const router = renderAt('/org');

    expect(
      await screen.findByRole('heading', { name: 'Bienvenue dans TAKIBO' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });
});
