import { expect, test } from './fixtures';

const FAKE_TOKEN = 'ZWViZWNiNTktZjMwMS00ODY5LTg3ZWQtNmFmNTY2NDEyNjY2';

test.describe('Auth flow', () => {
  test('unauthenticated home shows the welcome screen, not the task list', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /welcome to todoai/i })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^sign in$/i }).first()).toHaveAttribute('href', '/login');
    await expect(page.getByRole('link', { name: /create account/i })).toHaveAttribute('href', '/register');
  });

  test('navigating to a todo detail when unauthenticated redirects to home', async ({ page }) => {
    await page.goto('/todo/some-id');

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: /welcome to todoai/i })).toBeVisible();
  });

  test('login form stores the fake token in localStorage and unlocks the task list', async ({ page }) => {
    await page.goto('/login');

    const form = page.getByRole('form', { name: /login form/i });
    await form.getByLabel('Email').fill('user@example.com');
    await form.getByLabel('Password').fill('pwd');
    await form.getByRole('button', { name: /^sign in$/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: /my tasks/i })).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).toBe(FAKE_TOKEN);
  });

  test('register form creates a user and stores the fake token', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel(/name/i).fill('Anna');
    await page.getByLabel('Password').fill('pwd');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: /my tasks/i })).toBeVisible();

    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).toBe(FAKE_TOKEN);
  });

  test('forgot password accordion opens and shows a confirmation message', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /forgot password\?/i }).click();
    const forgotForm = page.getByRole('form', { name: /forgot password form/i });
    await forgotForm.getByLabel('Email').fill('user@example.com');
    await forgotForm.getByRole('button', { name: /send reset link/i }).click();

    await expect(forgotForm).toContainText(/if an account exists for user@example\.com/i);
  });

  test('logout removes the token and returns to the welcome screen', async ({ page }) => {
    await page.addInitScript(
      ([token]) => {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify({ email: 'tester@example.com' }));
      },
      [FAKE_TOKEN],
    );
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: /my tasks/i })).toBeVisible();

    await page.getByRole('button', { name: /sign out/i }).click();

    await expect(page.getByRole('heading', { level: 1, name: /welcome to todoai/i })).toBeVisible();
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).toBeNull();
  });

  test('login form shows validation errors for missing email and short password', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /^sign in$/i }).click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('register form works without providing a name', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('noname@example.com');
    await page.getByLabel('Password').fill('pwd');
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: /my tasks/i })).toBeVisible();
  });

  test('register form shows validation error for missing email', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('header shows sign in and sign up links when unauthenticated', async ({ page }) => {
    await page.goto('/');

    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: /^sign in$/i })).toBeVisible();
    await expect(header.getByRole('link', { name: /^sign up$/i })).toBeVisible();
  });
});
