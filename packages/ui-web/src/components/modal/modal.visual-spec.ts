import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('Modal visual', () => {
      test('open', async ({ page }) => {
        await matchStorySnapshot(page, 'components-modal--open', 'open', theme);
      });

      test('title-only', async ({ page }) => {
        await matchStorySnapshot(page, 'components-modal--title-only', 'title-only', theme);
      });

      test('with-footer', async ({ page }) => {
        await matchStorySnapshot(page, 'components-modal--with-footer', 'with-footer', theme);
      });
    });
  });
}
