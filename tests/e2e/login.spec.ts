import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

function makeFakeToken(claims: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none' })}.${encode(claims)}.signature-non-verifiee`;
}

const fakeLoginResponse = {
  accessToken: makeFakeToken({
    subject_type: 'HUMAN',
    auth_method: 'PASSWORD',
    roles: ['R_ORG_OWNER', 'R_SPACE_ADMIN'],
    groups: ['G_SPACE_ADMINS'],
    permissions: ['P_USER_READ', 'P_USER_WRITE'],
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

async function fillValidForm(page: Page) {
  await page.getByLabel('Code organisation').fill('acme');
  await page.getByLabel('Code space').fill('finance');
  await page.getByLabel('Adresse courriel').fill('pi@takibo.io');
  await page.getByLabel('Mot de passe', { exact: true }).fill('braise-et-frontieres');
}

test.describe('Page de connexion TAKIBO', () => {
  test("la racine redirige vers /login et la page s'affiche (AC-03, AC-04)", async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenue dans TAKIBO' })).toBeVisible();
    await expect(page.getByLabel('Code organisation')).toBeVisible();
    await expect(page.getByLabel('Code space')).toBeVisible();
    await expect(page.getByLabel('Adresse courriel')).toBeVisible();
    await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible();
  });

  test('valide le formulaire côté client', async ({ page }) => {
    await page.goto('/login');

    // Courriel invalide → message près du champ (AC-06).
    await page.getByLabel('Adresse courriel').fill('pas-un-courriel');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText('Veuillez saisir une adresse courriel valide.')).toBeVisible();

    // Codes et mot de passe absents → messages accessibles (AC-07).
    await expect(page.getByText("Veuillez saisir le code de l'organisation.")).toBeVisible();
    await expect(page.getByText('Veuillez saisir le code du space.')).toBeVisible();
    await expect(page.getByText('Veuillez saisir votre mot de passe.')).toBeVisible();

    // Bascule afficher/masquer sans perdre la valeur (AC-08).
    const passwordInput = page.getByLabel('Mot de passe', { exact: true });
    await passwordInput.fill('braise-et-frontieres');
    await page.getByRole('button', { name: 'Afficher le mot de passe' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(passwordInput).toHaveValue('braise-et-frontieres');
    await page.getByRole('button', { name: 'Masquer le mot de passe' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('ouvre la session sur un login accepté par le backend', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({ json: fakeLoginResponse });
    });
    await page.goto('/login');

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/session$/);
    await expect(page.getByRole('heading', { name: 'Connexion réussie' })).toBeVisible();
    await expect(page.getByText('R_ORG_OWNER')).toBeVisible();
    await expect(page.getByText('G_SPACE_ADMINS')).toBeVisible();
    await expect(page.getByText('P_USER_WRITE')).toBeVisible();

    // Le mot de passe et le token ne touchent ni l'URL ni le stockage (AC-12).
    expect(page.url()).not.toContain('braise-et-frontieres');
    const storedValues = await page.evaluate(() =>
      JSON.stringify({ ...window.localStorage, ...window.sessionStorage }),
    );
    expect(storedValues).not.toContain('braise-et-frontieres');
    expect(storedValues).not.toContain(fakeLoginResponse.accessToken);

    // Déconnexion → retour au login, /session redevient inaccessible.
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/session');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('affiche un message générique sur identifiants refusés', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({ status: 401, json: { error: 'INVALID_CREDENTIALS' } });
    });
    await page.goto('/login');

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByRole('alert')).toContainText('Identifiants invalides.');
    await expect(page).toHaveURL(/\/login$/);
  });
});
