import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

function makeFakeToken(claims: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none' })}.${encode(claims)}.signature-non-verifiee`;
}

const ORG_ID = '11111111-1111-1111-1111-111111111111';

const fakeLoginResponse = {
  accessToken: makeFakeToken({
    subject_type: 'HUMAN',
    auth_method: 'PASSWORD',
    takibo_scope_level: 'ORGANIZATION',
    roles: ['R_ORG_ADMIN', 'R_ORG_OWNER'],
    groups: ['G_ORG_ADMINS'],
    permissions: ['P_READ_ORG', 'P_CREATE_SPACE'],
    exp: 4102444800,
  }),
  tokenType: 'Bearer',
  expiresIn: 300,
  scopeLevel: 'ORGANIZATION',
  organizationId: ORG_ID,
  accountId: '33333333-3333-3333-3333-333333333333',
};

const fakeSpacesPage = {
  content: [
    {
      id: 'aaaa1111-0000-0000-0000-000000000001',
      orgId: ORG_ID,
      code: 'finance',
      name: 'Finance',
      status: 'ACTIVE',
    },
    {
      id: 'aaaa1111-0000-0000-0000-000000000002',
      orgId: ORG_ID,
      code: 'rh',
      name: 'RH',
      status: 'SUSPENDED',
    },
  ],
  page: 0,
  size: 50,
  totalElements: 2,
  totalPages: 1,
};

async function fillValidForm(page: Page) {
  await page.getByLabel('Organisation').fill('takibo-demo');
  await page.getByLabel('Adresse courriel').fill('pi@takibo.io');
  await page.getByLabel('Mot de passe', { exact: true }).fill('braise-et-frontieres');
}

test.describe('Connexion organisationnelle TAKIBO (IAM 31 / UI 01.6)', () => {
  test("la racine redirige vers /login et la page à trois champs s'affiche", async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenue dans TAKIBO' })).toBeVisible();
    await expect(page.getByLabel('Organisation')).toBeVisible();
    await expect(page.getByLabel('Adresse courriel')).toBeVisible();
    await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Code space')).toHaveCount(0);
  });

  test('valide le formulaire côté client', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Adresse courriel').fill('pas-un-courriel');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText('Veuillez saisir une adresse courriel valide.')).toBeVisible();
    await expect(page.getByText("Veuillez saisir le code de l'organisation.")).toBeVisible();
    await expect(page.getByText('Veuillez saisir votre mot de passe.')).toBeVisible();

    const passwordInput = page.getByLabel('Mot de passe', { exact: true });
    await passwordInput.fill('braise-et-frontieres');
    await page.getByRole('button', { name: 'Afficher le mot de passe' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(passwordInput).toHaveValue('braise-et-frontieres');
    await page.getByRole('button', { name: 'Masquer le mot de passe' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('ouvre la Console Organisation sur un login accepté', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({ json: fakeLoginResponse });
    });
    await page.route(`**/api/v1/orgs/${ORG_ID}/spaces**`, async (route) => {
      await route.fulfill({ json: fakeSpacesPage });
    });
    await page.goto('/login');

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/org$/);
    await expect(page.getByRole('heading', { name: 'Bienvenue, pi' })).toBeVisible();
    await expect(page.getByText('Console Organisation')).toBeVisible();
    await expect(page.getByText('R_ORG_OWNER')).toBeVisible();
    await expect(page.getByText('Finance', { exact: true })).toBeVisible();
    await expect(page.getByText('SUSPENDED')).toBeVisible();
    // L'entrée en space reste honnêtement désactivée (IAM 33).
    await expect(
      page.getByRole('button', { name: /Entrer — récit IAM 33/ }).first(),
    ).toBeDisabled();

    // Le mot de passe et le token ne touchent ni l'URL ni le stockage (AC-12).
    expect(page.url()).not.toContain('braise-et-frontieres');
    const storedValues = await page.evaluate(() =>
      JSON.stringify({ ...window.localStorage, ...window.sessionStorage }),
    );
    expect(storedValues).not.toContain('braise-et-frontieres');
    expect(storedValues).not.toContain(fakeLoginResponse.accessToken);

    // Déconnexion → retour au login, /org redevient inaccessible.
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto('/org');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('affiche le message uniforme sur identifiants refusés', async ({ page }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        json: { code: 'AUTHENTICATION_FAILED', message: 'Impossible de valider cette connexion.' },
      });
    });
    await page.goto('/login');

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByRole('alert')).toContainText('Impossible de valider cette connexion.');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('explique l’absence d’autorité sur la liste des spaces (IAM 32 à venir)', async ({
    page,
  }) => {
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({ json: fakeLoginResponse });
    });
    await page.route(`**/api/v1/orgs/${ORG_ID}/spaces**`, async (route) => {
      await route.fulfill({ status: 403, json: { code: 'ACCESS_DENIED' } });
    });
    await page.goto('/login');

    await fillValidForm(page);
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page.getByText(/récit IAM 32/)).toBeVisible();
  });
});
