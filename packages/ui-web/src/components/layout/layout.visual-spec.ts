import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('Layout visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-layout--default', 'default', theme);
      });

      test('authenticated', async ({ page }) => {
        await matchStorySnapshot(page, 'components-layout--authenticated', 'authenticated', theme);
      });
    });
  });
}
