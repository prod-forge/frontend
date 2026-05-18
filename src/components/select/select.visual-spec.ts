import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('Select visual', () => {
      test('sort-by', async ({ page }) => {
        await matchStorySnapshot(page, 'components-select--sort-by', 'sort-by', theme);
      });

      test('order', async ({ page }) => {
        await matchStorySnapshot(page, 'components-select--order', 'order', theme);
      });

      test('no-label', async ({ page }) => {
        await matchStorySnapshot(page, 'components-select--no-label', 'no-label', theme);
      });
    });
  });
}
