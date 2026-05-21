import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('Preloader visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-preloader--default', 'default', theme);
      });

      test('in container', async ({ page }) => {
        await matchStorySnapshot(page, 'components-preloader--in-container', 'in-container', theme);
      });
    });
  });
}
