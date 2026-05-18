import { expect, test } from './fixtures';

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'light');
      }
    });
  });

  test('toggling the theme flips data-theme on <html>', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.getByRole('button', { name: /switch to dark mode/i }).click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: /switch to light mode/i })).toBeVisible();
  });

  test('selected theme persists in localStorage across reloads', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: /switch to light mode/i })).toBeVisible();
  });
});

test.describe('Theme system preference', () => {
  test('defaults to dark when no stored theme and prefers-color-scheme is dark', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();

    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: /switch to light mode/i })).toBeVisible();

    await context.close();
  });
});
