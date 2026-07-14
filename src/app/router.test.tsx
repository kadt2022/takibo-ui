import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
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

describe('router — shell UI 01', () => {
  it('affiche l’écran de connexion sur /login', async () => {
    renderAt('/login');
    expect(
      await screen.findByRole('heading', { name: 'Bienvenue dans TAKIBO' }),
    ).toBeInTheDocument();
  });

  it('ouvre le tableau de bord du contexte Organisation sur /app/dashboard', async () => {
    renderAt('/app/dashboard');

    expect(await screen.findByRole('heading', { name: /Bienvenue, John Doe/ })).toBeInTheDocument();
    // Le badge de contexte rend la frontière visible.
    expect(screen.getByText('Contexte actuel')).toBeInTheDocument();
    expect(screen.getAllByText('Organisation').length).toBeGreaterThan(0);
    // Les quatre onglets du contexte Organisation.
    expect(screen.getByRole('link', { name: 'Tableau de bord' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mes Spaces' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gestion des Spaces' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Paramètres' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Créer un Space/ })).toBeDisabled();
  });

  it('redirige /app vers /app/dashboard', async () => {
    const router = renderAt('/app');
    await screen.findByRole('heading', { name: /Bienvenue, John Doe/ });
    expect(router.state.location.pathname).toBe('/app/dashboard');
  });

  it('navigue vers « Mes Spaces » et garde l’ouverture de space désactivée', async () => {
    const user = userEvent.setup();
    renderAt('/app/dashboard');

    await user.click(await screen.findByRole('link', { name: 'Mes Spaces' }));

    expect(await screen.findByRole('heading', { name: 'Mes Spaces' })).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    const [openButton] = screen.getAllByRole('button', { name: 'Ouvrir' });
    expect(openButton).toBeDefined();
    expect(openButton!).toBeDisabled();
    // Support est suspendu → non sélectionnable → « Indisponible ».
    expect(screen.getByText('Indisponible')).toBeInTheDocument();
  });

  it('garde la création de Space désactivée tant que le flux est absent', async () => {
    const user = userEvent.setup();
    renderAt('/app/dashboard');

    await user.click(await screen.findByRole('link', { name: 'Gestion des Spaces' }));

    expect(await screen.findByRole('heading', { name: 'Gestion des Spaces' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Créer un Space' })).toBeDisabled();
  });

  it('replie et déploie le menu latéral', async () => {
    const user = userEvent.setup();
    renderAt('/app/dashboard');

    const collapse = await screen.findByRole('button', { name: 'Réduire le menu' });
    await user.click(collapse);
    expect(screen.getByRole('button', { name: 'Déployer le menu' })).toBeInTheDocument();
  });

  it('rend un état « introuvable » sur une route inconnue', async () => {
    renderAt('/nowhere');
    expect(await screen.findByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument();
  });
});
