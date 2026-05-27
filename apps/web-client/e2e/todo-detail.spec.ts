import { expect, test } from './fixtures';

const FAKE_TOKEN = 'ZWViZWNiNTktZjMwMS00ODY5LTg3ZWQtNmFmNTY2NDEyNjY2';

test.describe('Todo detail page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ([token]) => {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify({ email: 'tester@example.com' }));
      },
      [FAKE_TOKEN],
    );
  });

  test('shows a title, status and back link after navigating from home', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();

    await expect(page).toHaveURL(/\/todo\/[\w-]+$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/^(Done|To Do)$/).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();
  });

  test('"Back to Home" link returns to the home page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();

    await page.getByRole('link', { name: /back to home/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: /my tasks/i })).toBeVisible();
  });

  test('unknown todo id shows the not-found state with a link home', async ({ page }) => {
    await page.goto('/todo/this-id-does-not-exist');

    await expect(page.getByRole('heading', { level: 2, name: /task not found/i })).toBeVisible();

    await page.getByRole('link', { name: /go back to home/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: /my tasks/i })).toBeVisible();
  });

  test('does not show an error banner when a todo is not found', async ({ page }) => {
    await page.goto('/todo/this-id-does-not-exist');

    await expect(page.getByRole('heading', { level: 2, name: /task not found/i })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('shows an error banner when the fetch fails with a server error', async ({ page }) => {
    await page.route(/\/api\/v1\/todos\/[^?]+$/, (route) =>
      route.fulfill({ body: '{}', contentType: 'application/json', status: 500 }),
    );

    await page.goto('/todo/some-id');

    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('lets the user edit the title via the pencil button and Enter', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();

    await page.getByRole('button', { name: /edit title/i }).click();

    const titleInput = page.getByRole('textbox', { name: /title/i });
    await titleInput.fill('Edited via E2E');
    await titleInput.press('Enter');

    await expect(page.getByRole('heading', { level: 1, name: 'Edited via E2E' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /title/i })).toHaveCount(0);
  });

  test('lets the user edit the description and submits on blur', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();

    await page.getByRole('button', { name: /edit description/i }).click();

    const descTextarea = page.getByRole('textbox', { name: /description/i });
    await descTextarea.fill('Updated description via blur');
    await descTextarea.blur();

    await expect(page.getByText('Updated description via blur')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /description/i })).toHaveCount(0);
  });

  test('shows a validation error and stays in edit mode for an over-long title', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();

    await page.getByRole('button', { name: /edit title/i }).click();

    const titleInput = page.getByRole('textbox', { name: /title/i });
    await titleInput.fill('a'.repeat(51));
    await titleInput.press('Enter');

    await expect(page.getByRole('alert')).toContainText(/50 characters or fewer/i);
    await expect(page.getByRole('textbox', { name: /title/i })).toBeVisible();
  });

  test('opens a confirmation modal when the delete button is clicked', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();
    await expect(page).toHaveURL(/\/todo\//);

    await page.getByRole('button', { name: /delete task/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /are you sure you want to delete\?/i })).toBeVisible();
  });

  test('clicking outside the modal closes it without deleting', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();
    await expect(page).toHaveURL(/\/todo\//);
    const titleBeforeOpen = await page.getByRole('heading', { level: 1 }).innerText();

    await page.getByRole('button', { name: /delete task/i }).click();
    await page.getByTestId('modal-overlay').click({ position: { x: 5, y: 5 } });

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/todo\//);
    await expect(page.getByRole('heading', { level: 1, name: titleBeforeOpen })).toBeVisible();
  });

  test('clicking Delete deletes the todo and redirects to home', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();
    await expect(page).toHaveURL(/\/todo\//);
    const deletedTitle = await page.getByRole('heading', { level: 1 }).innerText();

    await page.getByRole('button', { name: /delete task/i }).click();
    await page.getByRole('button', { name: /^delete$/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1, name: /my tasks/i })).toBeVisible();
    await expect(page.getByRole('link', { exact: true, name: deletedTitle })).toHaveCount(0);
  });

  test('shows "Done" status badge for a completed todo', async ({ page }) => {
    await page.goto('/');

    const completedTodoLink = page
      .getByRole('article')
      .filter({ has: page.getByRole('button', { name: /mark as to do/i }) })
      .first()
      .locator('a')
      .first();
    await completedTodoLink.click();
    await page.waitForURL(/\/todo\//);

    await expect(page.getByText('Done')).toBeVisible();
  });

  test('Escape key cancels description editing without saving', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();

    await page.getByRole('button', { name: /edit description/i }).click();
    const textarea = page.getByRole('textbox', { name: /description/i });
    await textarea.fill('This text should be discarded on escape');
    await textarea.press('Escape');

    await expect(page.getByRole('textbox', { name: /description/i })).toHaveCount(0);
    await expect(page.getByText('This text should be discarded on escape')).toHaveCount(0);
  });

  test('clears the description and shows the empty placeholder', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();

    await page.getByRole('button', { name: /edit description/i }).click();
    await page.getByRole('textbox', { name: /description/i }).fill('');
    await page.getByRole('textbox', { name: /description/i }).blur();

    await expect(page.getByText(/no description/i)).toBeVisible();
  });

  test('error notifier auto-dismisses after the timer expires', async ({ page }) => {
    test.setTimeout(25000);

    await page.route(/\/api\/v1\/todos\/[^?]+$/, (route) =>
      route.fulfill({ body: '{}', contentType: 'application/json', status: 500 }),
    );

    await page.goto('/todo/some-id');

    await expect(page.getByRole('alert')).toBeVisible();

    // React StrictMode dispatches the fetch twice in dev → two errors queued,
    // each auto-dismissed after ~4 s, so we allow up to 20 s total.
    await expect(page.getByRole('alert')).toHaveCount(0, { timeout: 20000 });
  });

  test('error notifier pauses the countdown on hover and resumes on mouse leave', async ({ page }) => {
    test.setTimeout(30000);

    await page.route(/\/api\/v1\/todos\/[^?]+$/, (route) =>
      route.fulfill({ body: '{}', contentType: 'application/json', status: 500 }),
    );

    await page.goto('/todo/some-id');

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();

    // Hover over the alert — triggers mouseEnter and pauses the countdown
    await alert.hover();
    await page.waitForTimeout(1500);
    await expect(alert).toBeVisible();

    // Move away — triggers mouseLeave and resumes the countdown
    await page.mouse.move(0, 0);

    await expect(alert).toHaveCount(0, { timeout: 22000 });
  });

  test('error notifier dismiss button removes the error immediately', async ({ page }) => {
    await page.route(/\/api\/v1\/todos\/[^?]+$/, (route) =>
      route.fulfill({ body: '{}', contentType: 'application/json', status: 500 }),
    );

    await page.goto('/todo/some-id');

    await expect(page.getByRole('alert')).toBeVisible();

    await page.getByRole('button', { name: /dismiss error/i }).click();

    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('Escape cancels editing and restores the original title', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[href^="/todo/"]').first().click();
    await expect(page).toHaveURL(/\/todo\//);
    await expect(page.getByRole('button', { name: /edit title/i })).toBeVisible();
    const originalTitle = await page.getByRole('heading', { level: 1 }).innerText();

    await page.getByRole('button', { name: /edit title/i }).click();
    const titleInput = page.getByRole('textbox', { name: /title/i });
    await titleInput.fill('Should be discarded');
    await titleInput.press('Escape');

    await expect(page.getByRole('heading', { level: 1, name: originalTitle })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /title/i })).toHaveCount(0);
  });
});
