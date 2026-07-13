import { expect, test } from '@playwright/test';

/**
 * Récit UI 01 — socle graphique. Aucun backend : le shell tourne sur des
 * données de démonstration. Ces tests vérifient la coquille et ses frontières.
 */
test.describe('Shell TAKIBO (UI 01)', () => {
  test("la racine mène au login, puis « Se connecter » ouvre le contexte Organisation", async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenue dans TAKIBO' })).toBeVisible();

    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/app\/dashboard$/);
    await expect(page.getByRole('heading', { name: /Bienvenue, John Doe/ })).toBeVisible();
    // Le badge de contexte est présent.
    await expect(page.getByText('Contexte actuel')).toBeVisible();
  });

  test('navigue entre les onglets du contexte Organisation', async ({ page }) => {
    await page.goto('/app/dashboard');

    await page.getByRole('link', { name: 'Mes Spaces', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/my-spaces$/);
    await expect(page.getByRole('heading', { name: 'Mes Spaces' })).toBeVisible();
    await expect(page.getByText('Finance', { exact: true })).toBeVisible();
    await expect(page.getByText('Indisponible')).toBeVisible();

    await page.getByRole('link', { name: 'Gestion des Spaces', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/spaces$/);
    await expect(page.getByRole('button', { name: 'Créer un Space' })).toBeVisible();

    await page.getByRole('link', { name: 'Paramètres', exact: true }).click();
    await expect(page).toHaveURL(/\/app\/settings$/);
  });

  test('bascule le thème clair/sombre', async ({ page }) => {
    await page.goto('/app/dashboard');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Passer au thème clair' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});
