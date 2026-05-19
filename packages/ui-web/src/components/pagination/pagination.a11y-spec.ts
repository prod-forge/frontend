import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('Pagination a11y', () => {
  test('two-pages', async ({ page }) => {
    await checkStoryA11y(page, 'components-pagination--two-pages');
  });

  test('many-pages', async ({ page }) => {
    await checkStoryA11y(page, 'components-pagination--many-pages');
  });

  test('first-page', async ({ page }) => {
    await checkStoryA11y(page, 'components-pagination--first-page');
  });

  test('last-page', async ({ page }) => {
    await checkStoryA11y(page, 'components-pagination--last-page');
  });
});
