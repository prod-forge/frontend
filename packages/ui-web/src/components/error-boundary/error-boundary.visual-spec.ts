import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('ErrorBoundary visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-errorboundary--default', 'default', theme);
      });

      test('error state', async ({ page }) => {
        await matchStorySnapshot(page, 'components-errorboundary--error-state', 'error-state', theme);
      });
    });
  });
}
