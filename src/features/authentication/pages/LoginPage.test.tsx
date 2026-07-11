import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppProviders } from '@/app/providers';
import * as loginApi from '@/features/authentication/api/login-api';
import { LoginPage } from '@/features/authentication/pages/LoginPage';

function renderLoginPage() {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('affiche la page de connexion TAKIBO', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: 'Bienvenue dans TAKIBO' })).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse courriel')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mot de passe oublié ?' })).toBeInTheDocument();
  });

  it('affiche une erreur près du champ lorsque le courriel est invalide (AC-06)', async () => {
    const user = userEvent.setup();
    renderLoginPage();

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

    await user.type(screen.getByLabelText('Adresse courriel'), 'pi@takibo.io');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByText('Veuillez saisir votre mot de passe.')).toBeVisible();
    expect(screen.getByLabelText('Mot de passe')).toHaveAttribute('aria-invalid', 'true');
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

  it('indique un état de chargement et empêche les soumissions multiples (AC-09)', async () => {
    let resolveAuthentication: (() => void) | undefined;
    const authenticateSpy = vi.spyOn(loginApi, 'authenticate').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAuthentication = () => resolve({ status: 'service-not-connected' });
        }),
    );
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('Adresse courriel'), 'pi@takibo.io');
    await user.type(screen.getByLabelText('Mot de passe'), 'braise-et-frontieres');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    const loadingButton = await screen.findByRole('button', { name: /Connexion en cours/ });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute('aria-busy', 'true');

    await user.click(loadingButton);
    expect(authenticateSpy).toHaveBeenCalledTimes(1);

    resolveAuthentication?.();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Se connecter' })).toBeEnabled());
    expect(screen.getByRole('status')).toHaveTextContent('Aucune session n’a été créée.');
  });
});
