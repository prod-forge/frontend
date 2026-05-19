import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('ErrorBanner visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-errorbanner--default', 'default', theme);
      });

      test('long message', async ({ page }) => {
        await matchStorySnapshot(page, 'components-errorbanner--long-message', 'long-message', theme);
      });
    });
  });
}
