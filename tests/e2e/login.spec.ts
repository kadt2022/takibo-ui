import { expect, test } from '@playwright/test';

test.describe('Page de connexion TAKIBO', () => {
  test("la racine redirige vers /login et la page s'affiche (AC-03, AC-04)", async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenue dans TAKIBO' })).toBeVisible();
    await expect(page.getByLabel('Adresse courriel')).toBeVisible();
    await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible();
  });

  test('valide le formulaire et exerce le parcours complet', async ({ page }) => {
    await page.goto('/login');

    // Courriel invalide → message près du champ (AC-06).
    await page.getByLabel('Adresse courriel').fill('pas-un-courriel');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText('Veuillez saisir une adresse courriel valide.')).toBeVisible();

    // Mot de passe absent → message accessible (AC-07).
    await page.getByLabel('Adresse courriel').fill('pi@takibo.io');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText('Veuillez saisir votre mot de passe.')).toBeVisible();

    // Bascule afficher/masquer sans perdre la valeur (AC-08).
    const passwordInput = page.getByLabel('Mot de passe', { exact: true });
    await passwordInput.fill('braise-et-frontieres');
    await page.getByRole('button', { name: 'Afficher le mot de passe' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(passwordInput).toHaveValue('braise-et-frontieres');
    await page.getByRole('button', { name: 'Masquer le mot de passe' }).click();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Soumission valide → état de chargement puis message honnête (AC-09).
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByRole('button', { name: /Connexion en cours/ })).toBeDisabled();
    await expect(page.getByRole('status')).toContainText('Aucune session n’a été créée.');

    // Le mot de passe ne fuit ni dans l'URL ni dans le stockage (AC-12).
    expect(page.url()).not.toContain('braise-et-frontieres');
    const storedValues = await page.evaluate(() => ({
      local: JSON.stringify(window.localStorage),
      session: JSON.stringify(window.sessionStorage),
    }));
    expect(storedValues.local).not.toContain('braise-et-frontieres');
    expect(storedValues.session).not.toContain('braise-et-frontieres');
  });
});
