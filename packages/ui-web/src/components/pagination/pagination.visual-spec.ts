import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('Pagination visual', () => {
      test('two-pages', async ({ page }) => {
        await matchStorySnapshot(page, 'components-pagination--two-pages', 'two-pages', theme);
      });

      test('many-pages', async ({ page }) => {
        await matchStorySnapshot(page, 'components-pagination--many-pages', 'many-pages', theme);
      });

      test('first-page', async ({ page }) => {
        await matchStorySnapshot(page, 'components-pagination--first-page', 'first-page', theme);
      });

      test('last-page', async ({ page }) => {
        await matchStorySnapshot(page, 'components-pagination--last-page', 'last-page', theme);
      });
    });
  });
}
