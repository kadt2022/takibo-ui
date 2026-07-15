import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Récit UI 02 — connexion réelle et session organisationnelle.
 * L'API de login est interceptée (pas de backend en CI) pour piloter le flux
 * complet : formulaire → session ORGANIZATION → shell honnête → déconnexion.
 */

function makeToken(claims: Record<string, unknown>): string {
  const b64 = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64(claims)}.sig`;
}

const LOGIN_RESPONSE = {
  accessToken: makeToken({
    subject_type: 'HUMAN',
    takibo_scope_level: 'ORGANIZATION',
    auth_method: 'PASSWORD',
    org_id: '9eb7b8d5-79c8-4ac5-b4b8-b61ad332390f',
    account_id: 'a1b2c3d4-0000-0000-0000-000000000000',
    roles: ['R_ORG_ADMIN'],
    groups: [],
    permissions: [],
  }),
  tokenType: 'Bearer',
  expiresIn: 3600,
  scopeLevel: 'ORGANIZATION',
  organizationId: '9eb7b8d5-79c8-4ac5-b4b8-b61ad332390f',
  accountId: 'a1b2c3d4-0000-0000-0000-000000000000',
};

async function mockLogin(page: Page) {
  await page.route('**/api/v1/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(LOGIN_RESPONSE),
    });
  });
}

async function login(page: Page) {
  await mockLogin(page);
  await page.goto('/login');
  await page.getByLabel('Organisation', { exact: true }).fill('acme');
  await page.getByLabel('Adresse courriel', { exact: true }).fill('john.doe@acme.com');
  await page.getByLabel('Mot de passe', { exact: true }).fill('secret123');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/app\/dashboard$/);
}

test.describe('Session organisationnelle (UI 02)', () => {
  test('la racine mène au login, la connexion ouvre le shell sur l’identité réelle', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenue dans TAKIBO' })).toBeVisible();

    await login(page);

    await expect(
      page.getByRole('heading', { name: /Bienvenue, john\.doe@acme\.com/ }),
    ).toBeVisible();
    await expect(page.getByText('Contexte actuel')).toBeVisible();
  });

  test('protège /app/** : sans session, redirige vers /login', async ({ page }) => {
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenue dans TAKIBO' })).toBeVisible();
  });

  test('navigue entre les onglets du contexte Organisation', async ({ page }) => {
    await login(page);

    await page.getByRole('link', { name: 'Mes Spaces', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/my-spaces$/);
    await expect(page.getByRole('heading', { name: 'Mes Spaces' })).toBeVisible();
    await expect(page.getByText('Finance', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ouvrir' }).first()).toBeDisabled();
    await expect(page.getByText('Indisponible')).toBeVisible();

    await page.getByRole('link', { name: 'Gestion des Spaces', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/spaces$/);
    await expect(page.getByRole('button', { name: 'Créer un Space' })).toBeDisabled();

    await page.getByRole('link', { name: 'Paramètres', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/settings$/);
  });

  test('la déconnexion ferme la session et revient au login', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenue dans TAKIBO' })).toBeVisible();

    // La session vit en mémoire : revenir en arrière ne rouvre pas le shell.
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('bascule le thème clair/sombre', async ({ page }) => {
    await login(page);
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Passer au thème clair' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('le tiroir mobile reste complet même après un repli desktop', async ({ page }) => {
    await login(page);

    await page.getByRole('button', { name: 'Réduire le menu' }).click();
    await expect(page.getByRole('button', { name: 'Déployer le menu' })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 800 });
    await page.getByRole('button', { name: 'Ouvrir le menu' }).click();

    await expect(page.getByRole('link', { name: 'Gestion des Spaces', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Réduire le menu' })).toHaveCount(0);
  });
});
