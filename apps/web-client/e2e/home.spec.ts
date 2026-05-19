import { expect, test } from './fixtures';

const FAKE_TOKEN = 'ZWViZWNiNTktZjMwMS00ODY5LTg3ZWQtNmFmNTY2NDEyNjY2';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ([token]) => {
        localStorage.setItem('auth-token', token);
        localStorage.setItem('auth-user', JSON.stringify({ email: 'tester@example.com' }));
      },
      [FAKE_TOKEN],
    );
    await page.goto('/');
  });

  test('renders the header and the My Tasks heading', async ({ page }) => {
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('banner')).toContainText('TodoAI');
    await expect(page.getByRole('heading', { level: 1, name: /my tasks/i })).toBeVisible();
  });

  test('renders the default page of todos and the completion summary', async ({ page }) => {
    await expect(page.getByText(/^\d+ of \d+ completed$/)).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(10);
  });

  test('search filters the list and shows the empty state for no matches', async ({ page }) => {
    const search = page.getByRole('searchbox');

    await search.fill('storybook');
    const cards = page.getByRole('article');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText(/storybook/i);

    await search.fill('definitely-no-match-zzz');
    await expect(page.getByText(/no tasks match your search/i)).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(0);
  });

  test('paginates between page 1 and page 2', async ({ page }) => {
    await expect(page.getByRole('article')).toHaveCount(10);

    await page.getByRole('button', { name: 'Page 2' }).click();
    await expect(page.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');

    await page.getByRole('button', { name: /previous page/i }).click();
    await expect(page.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
  });

  test('shows all todos when "Per page" is large enough', async ({ page }) => {
    await page.getByRole('button', { name: /filters/i }).click();
    await page.getByLabel('Per page').selectOption('50');

    await expect(page.getByRole('navigation', { name: /pagination/i })).toHaveCount(0);
    await expect(page.getByRole('article')).toHaveCount(15);
  });

  test('reorders todos when changing sort order', async ({ page }) => {
    const firstCard = page.getByRole('article').first();
    const initialTitle = await firstCard.locator('a').first().innerText();

    await page.getByRole('button', { name: /filters/i }).click();
    await page.getByLabel('Order', { exact: true }).selectOption('desc');

    await expect(firstCard.locator('a').first()).not.toHaveText(initialTitle);
  });

  test('clicking a todo title navigates to its detail page', async ({ page }) => {
    const firstTitleLink = page.getByRole('article').first().locator('a').first();
    const href = await firstTitleLink.getAttribute('href');

    await firstTitleLink.click();

    await expect(page).toHaveURL(new RegExp(`${href!}$`));
    await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();
  });

  test('adds a new todo via the form and shows it in the list', async ({ page }) => {
    const articles = page.getByRole('article');
    await expect(articles).not.toHaveCount(0);
    const initialCount = await articles.count();

    await page.getByLabel('Title').fill('AAA E2E created task');
    await page.getByLabel('Description').fill('Created from Playwright');
    await page.getByRole('button', { name: /add task/i }).click();

    await expect(page.getByLabel('Title')).toHaveValue('');
    await expect(page.getByLabel('Description')).toHaveValue('');
    await expect(page.getByRole('link', { exact: true, name: 'AAA E2E created task' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(initialCount + 1);
  });

  test('shows a validation error for an empty title in the add form', async ({ page }) => {
    await page.getByRole('button', { name: /add task/i }).click();

    await expect(page.getByRole('alert')).toContainText(/title is required/i);
  });

  test('preserves the typed title when the POST response returns an empty title', async ({ page }) => {
    await page.route(/\/api\/v1\/todos/, async (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          body: JSON.stringify({ completed: false, description: '', id: 'new-id', title: '' }),
          contentType: 'application/json',
          status: 201,
        });
      }

      return route.fallback();
    });

    await page.getByLabel('Title').fill('Preserved E2E Title');
    await page.getByRole('button', { name: /add task/i }).click();

    await expect(page.getByRole('link', { exact: true, name: 'Preserved E2E Title' })).toBeVisible();
  });

  test('header shows the user name when the authenticated user has a name', async ({ page }) => {
    await page.addInitScript(() => {
      const FAKE_TOKEN = 'ZWViZWNiNTktZjMwMS00ODY5LTg3ZWQtNmFmNTY2NDEyNjY2';
      localStorage.setItem('auth-token', FAKE_TOKEN);
      localStorage.setItem('auth-user', JSON.stringify({ email: 'tester@example.com', name: 'Alice' }));
    });
    await page.goto('/');

    await expect(page.getByTestId('header-user')).toHaveText('Alice');
  });

  test('toggling a todo status updates the summary and the toggle label', async ({ page }) => {
    const summary = page.getByText(/^\d+ of \d+ completed$/);
    const initialSummary = (await summary.innerText()).trim();
    const [doneStr, , totalStr] = initialSummary.split(' ');
    const initialDone = Number(doneStr);
    const total = Number(totalStr);

    const initialDoneToggles = await page.getByRole('button', { name: /mark as to do/i }).count();
    const openCard = page
      .getByRole('article')
      .filter({ has: page.getByRole('button', { name: /mark as done/i }) })
      .first();
    const cardTitle = (await openCard.locator('a').first().innerText()).trim();

    await openCard.getByRole('button', { name: /mark as done/i }).click();

    await expect(summary).toHaveText(`${initialDone + 1} of ${total} completed`);
    await expect(page.getByRole('button', { name: /mark as to do/i })).toHaveCount(initialDoneToggles + 1);
    await expect(
      page
        .getByRole('article')
        .filter({ has: page.getByRole('link', { exact: true, name: cardTitle }) })
        .getByRole('button', { name: /mark as to do/i }),
    ).toBeVisible();
  });
});
