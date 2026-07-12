import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppProviders } from '@/app/providers';
import * as loginApi from '@/features/authentication/api/login-api';
import type { LoginSession } from '@/features/authentication/model/login';
import { LoginPage } from '@/features/authentication/pages/LoginPage';
import * as spacesApi from '@/features/organization/api/spaces-api';
import { OrganizationConsolePage } from '@/features/organization/pages/OrganizationConsolePage';

function makeFakeToken(claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'none' })}.${encode(claims)}.signature-non-verifiee`;
}

const fakeSession: LoginSession = {
  accessToken: makeFakeToken({
    subject_type: 'HUMAN',
    auth_method: 'PASSWORD',
    takibo_scope_level: 'ORGANIZATION',
    roles: ['R_ORG_OWNER'],
    groups: ['G_ORG_ADMINS'],
    permissions: ['P_READ_ORG'],
    exp: 4102444800,
  }),
  tokenType: 'Bearer',
  expiresIn: 300,
  scopeLevel: 'ORGANIZATION',
  organizationId: '11111111-1111-1111-1111-111111111111',
  accountId: '33333333-3333-3333-3333-333333333333',
};

function renderLoginPage() {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/org" element={<OrganizationConsolePage />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Organisation'), 'takibo-demo');
  await user.type(screen.getByLabelText('Adresse courriel'), 'pi@takibo.io');
  await user.type(screen.getByLabelText('Mot de passe'), 'braise-et-frontieres');
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('affiche la page de connexion TAKIBO à trois champs (IAM 31)', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: 'Bienvenue dans TAKIBO' })).toBeInTheDocument();
    expect(screen.getByLabelText('Organisation')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse courriel')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.queryByLabelText('Code space')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mot de passe oublié ?' })).toBeInTheDocument();
  });

  it('affiche une erreur près du champ lorsque le courriel est invalide (AC-06)', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Organisation'), 'takibo-demo');
    await user.type(screen.getByLabelText('Adresse courriel'), 'pas-un-courriel');
    await user.type(screen.getByLabelText('Mot de passe'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    const emailInput = screen.getByLabelText('Adresse courriel');
    expect(await screen.findByText('Veuillez saisir une adresse courriel valide.')).toBeVisible();
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAccessibleDescription('Veuillez saisir une adresse courriel valide.');
  });

  it('bloque la soumission sans mot de passe avec un message accessible (AC-07)', async () => {
    const authenticateSpy = vi.spyOn(loginApi, 'authenticate');
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Organisation'), 'takibo-demo');
    await user.type(screen.getByLabelText('Adresse courriel'), 'pi@takibo.io');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText('Veuillez saisir votre mot de passe.')).toBeVisible();
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('aria-invalid', 'true');
    expect(authenticateSpy).not.toHaveBeenCalled();
  });

  it("exige le code de l'organisation", async () => {
    const authenticateSpy = vi.spyOn(loginApi, 'authenticate');
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Adresse courriel'), 'pi@takibo.io');
    await user.type(screen.getByLabelText('Mot de passe'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText("Veuillez saisir le code de l'organisation.")).toBeVisible();
    expect(authenticateSpy).not.toHaveBeenCalled();
  });

  it('permet d’afficher puis de masquer le mot de passe sans perdre la valeur (AC-08)', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const passwordInput = screen.getByLabelText('Mot de passe');
    await user.type(passwordInput, 'braise-et-frontieres');

    await user.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(passwordInput).toHaveValue('braise-et-frontieres');

    await user.click(screen.getByRole('button', { name: 'Masquer le mot de passe' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveValue('braise-et-frontieres');
  });

  it('indique un état de chargement, empêche les soumissions multiples et ouvre la console (AC-09)', async () => {
    let resolveAuthentication: (() => void) | undefined;
    const authenticateSpy = vi.spyOn(loginApi, 'authenticate').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAuthentication = () => resolve(fakeSession);
        }),
    );
    vi.spyOn(spacesApi, 'fetchOrganizationSpaces').mockResolvedValue({
      kind: 'ok',
      spaces: [
        {
          id: '22222222-2222-2222-2222-222222222222',
          orgId: fakeSession.organizationId,
          code: 'finance',
          name: 'Finance',
          status: 'ACTIVE',
        },
      ],
    });
    const user = userEvent.setup();
    renderLoginPage();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    const loadingButton = await screen.findByRole('button', { name: /Connexion en cours/ });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');

    await user.click(loadingButton);
    expect(authenticateSpy).toHaveBeenCalledTimes(1);
    expect(authenticateSpy).toHaveBeenCalledWith(
      {
        email: 'pi@takibo.io',
        password: 'braise-et-frontieres',
        orgCode: 'takibo-demo',
      },
      expect.anything(),
    );

    resolveAuthentication?.();
    expect(await screen.findByRole('heading', { name: 'Bienvenue, pi' })).toBeVisible();
    expect(screen.getByText('Console Organisation')).toBeVisible();
    expect(screen.getByText('R_ORG_OWNER')).toBeVisible();
    expect(await screen.findByText('Finance')).toBeVisible();
  });

  it('affiche le message uniforme en cas d’échec de connexion', async () => {
    vi.spyOn(loginApi, 'authenticate').mockRejectedValue(
      new loginApi.LoginError('Impossible de valider cette connexion.'),
    );
    const user = userEvent.setup();
    renderLoginPage();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Impossible de valider cette connexion.');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Se connecter' })).toBeEnabled());
  });

  it('explique honnêtement l’absence d’autorité sur la liste des spaces (IAM 32 à venir)', async () => {
    vi.spyOn(loginApi, 'authenticate').mockResolvedValue(fakeSession);
    vi.spyOn(spacesApi, 'fetchOrganizationSpaces').mockResolvedValue({ kind: 'no-authority' });
    const user = userEvent.setup();
    renderLoginPage();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText(/récit IAM 32/)).toBeVisible();
  });
});
