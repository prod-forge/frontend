import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('Select a11y', () => {
  test('sort-by', async ({ page }) => {
    await checkStoryA11y(page, 'components-select--sort-by');
  });

  test('order', async ({ page }) => {
    await checkStoryA11y(page, 'components-select--order');
  });

  test('no-label', async ({ page }) => {
    await checkStoryA11y(page, 'components-select--no-label');
  });
});
