import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('ErrorNotifier visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'widgets-errors-errornotifier--default', 'default', theme);
      });

      test('with error', async ({ page }) => {
        await matchStorySnapshot(page, 'widgets-errors-errornotifier--with-error', 'with-error', theme);
      });

      test('multiple errors', async ({ page }) => {
        await matchStorySnapshot(page, 'widgets-errors-errornotifier--multiple-errors', 'multiple-errors', theme);
      });
    });
  });
}
