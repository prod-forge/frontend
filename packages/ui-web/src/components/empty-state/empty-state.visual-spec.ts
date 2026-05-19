import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('EmptyState visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-emptystate--default', 'default', theme);
      });

      test('custom message', async ({ page }) => {
        await matchStorySnapshot(page, 'components-emptystate--custom-message', 'custom-message', theme);
      });
    });
  });
}
