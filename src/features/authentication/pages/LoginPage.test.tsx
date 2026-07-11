import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppProviders } from '@/app/providers';
import * as loginApi from '@/features/authentication/api/login-api';
import type { LoginSession } from '@/features/authentication/model/login';
import { LoginPage } from '@/features/authentication/pages/LoginPage';
import { SessionPage } from '@/features/authentication/pages/SessionPage';

function makeFakeToken(claims: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({ alg: 'none' })}.${encode(claims)}.signature-non-verifiee`;
}

const fakeSession: LoginSession = {
  accessToken: makeFakeToken({
    subject_type: 'HUMAN',
    auth_method: 'PASSWORD',
    roles: ['R_ORG_OWNER'],
    groups: [],
    permissions: ['P_USER_READ'],
    exp: 4102444800,
  }),
  tokenType: 'Bearer',
  expiresIn: 900,
  scopeLevel: 'SPACE',
  organizationId: '11111111-1111-1111-1111-111111111111',
  spaceId: '22222222-2222-2222-2222-222222222222',
  accountId: '33333333-3333-3333-3333-333333333333',
  userId: '44444444-4444-4444-4444-444444444444',
};

function renderLoginPage() {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/session" element={<SessionPage />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Code organisation'), 'acme');
  await user.type(screen.getByLabelText('Code space'), 'finance');
  await user.type(screen.getByLabelText('Adresse courriel'), 'pi@takibo.io');
  await user.type(screen.getByLabelText('Mot de passe'), 'braise-et-frontieres');
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('affiche la page de connexion TAKIBO', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: 'Bienvenue dans TAKIBO' })).toBeInTheDocument();
    expect(screen.getByLabelText('Code organisation')).toBeInTheDocument();
    expect(screen.getByLabelText('Code space')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse courriel')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mot de passe oublié ?' })).toBeInTheDocument();
  });

  it('affiche une erreur près du champ lorsque le courriel est invalide (AC-06)', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Code organisation'), 'acme');
    await user.type(screen.getByLabelText('Code space'), 'finance');
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

    await user.type(screen.getByLabelText('Code organisation'), 'acme');
    await user.type(screen.getByLabelText('Code space'), 'finance');
    await user.type(screen.getByLabelText('Adresse courriel'), 'pi@takibo.io');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText('Veuillez saisir votre mot de passe.')).toBeVisible();
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('aria-invalid', 'true');
    expect(authenticateSpy).not.toHaveBeenCalled();
  });

  it('exige les codes organisation et space', async () => {
    const authenticateSpy = vi.spyOn(loginApi, 'authenticate');
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Adresse courriel'), 'pi@takibo.io');
    await user.type(screen.getByLabelText('Mot de passe'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText("Veuillez saisir le code de l'organisation.")).toBeVisible();
    expect(screen.getByText('Veuillez saisir le code du space.')).toBeVisible();
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

  it('indique un état de chargement, empêche les soumissions multiples et ouvre la session (AC-09)', async () => {
    let resolveAuthentication: (() => void) | undefined;
    const authenticateSpy = vi.spyOn(loginApi, 'authenticate').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAuthentication = () => resolve(fakeSession);
        }),
    );
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
        orgCode: 'acme',
        spaceCode: 'finance',
      },
      expect.anything(),
    );

    resolveAuthentication?.();
    expect(await screen.findByRole('heading', { name: 'Connexion réussie' })).toBeVisible();
    expect(screen.getByText('R_ORG_OWNER')).toBeVisible();
    expect(screen.getByText('P_USER_READ')).toBeVisible();
  });

  it('affiche le message utilisateur en cas d’échec de connexion', async () => {
    vi.spyOn(loginApi, 'authenticate').mockRejectedValue(
      new loginApi.LoginError('Identifiants invalides.'),
    );
    const user = userEvent.setup();
    renderLoginPage();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Identifiants invalides.');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Se connecter' })).toBeEnabled());
  });
});
