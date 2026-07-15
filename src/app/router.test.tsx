import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppProviders } from '@/app/providers';
import { routes } from '@/app/router';

function makeToken(claims: Record<string, unknown>): string {
  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(claims)}.sig`;
}

const OK_RESPONSE = {
  accessToken: makeToken({
    subject_type: 'HUMAN',
    takibo_scope_level: 'ORGANIZATION',
    auth_method: 'PASSWORD',
    org_id: 'org-uuid',
    account_id: 'acc-uuid',
    roles: ['R_ORG_ADMIN'],
    groups: [],
    permissions: [],
  }),
  tokenType: 'Bearer',
  expiresIn: 3600,
  scopeLevel: 'ORGANIZATION',
  organizationId: 'org-uuid',
  accountId: 'acc-uuid',
};

const fetchMock = vi.fn();

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

/** Passe par le vrai formulaire de login pour ouvrir une session ORGANIZATION. */
async function renderLoggedIn(user: UserEvent) {
  fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => OK_RESPONSE });
  const router = renderAt('/login');
  await user.type(screen.getByLabelText('Organisation'), 'acme');
  await user.type(screen.getByLabelText('Adresse courriel'), 'john.doe@acme.com');
  await user.type(screen.getByLabelText('Mot de passe'), 'secret123');
  await user.click(screen.getByRole('button', { name: 'Se connecter' }));
  await screen.findByRole('heading', { name: /Bienvenue, john\.doe@acme\.com/ });
  return router;
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('router — entrée et gardes', () => {
  it('affiche l’écran de connexion sur /login', async () => {
    renderAt('/login');
    expect(
      await screen.findByRole('heading', { name: 'Bienvenue dans TAKIBO' }),
    ).toBeInTheDocument();
  });

  it('protège /app/** : sans session, redirige vers /login', async () => {
    const router = renderAt('/app/dashboard');
    expect(
      await screen.findByRole('heading', { name: 'Bienvenue dans TAKIBO' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('rend un état « introuvable » sur une route inconnue', async () => {
    renderAt('/nowhere');
    expect(await screen.findByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument();
  });
});

describe('shell sous session ORGANIZATION', () => {
  it('ouvre le tableau de bord réel et rend la frontière visible', async () => {
    const user = userEvent.setup();
    await renderLoggedIn(user);

    expect(screen.getByText('Contexte actuel')).toBeInTheDocument();
    expect(screen.getAllByText('Organisation').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Tableau de bord' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mes Spaces' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gestion des Spaces' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Paramètres' })).toBeInTheDocument();
  });

  it('navigue vers « Mes Spaces » et garde l’ouverture de space désactivée', async () => {
    const user = userEvent.setup();
    await renderLoggedIn(user);

    await user.click(screen.getByRole('link', { name: 'Mes Spaces' }));

    expect(await screen.findByRole('heading', { name: 'Mes Spaces' })).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    const [openButton] = screen.getAllByRole('button', { name: 'Ouvrir' });
    expect(openButton!).toBeDisabled();
    expect(screen.getByText('Indisponible')).toBeInTheDocument();
  });

  it('replie et déploie le menu latéral', async () => {
    const user = userEvent.setup();
    await renderLoggedIn(user);

    await user.click(screen.getByRole('button', { name: 'Réduire le menu' }));
    expect(screen.getByRole('button', { name: 'Déployer le menu' })).toBeInTheDocument();
  });
});
