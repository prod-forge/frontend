import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('Input visual', () => {
      test('default', async ({ page }) => {
        await matchStorySnapshot(page, 'components-input--default', 'default', theme);
      });

      test('with-value', async ({ page }) => {
        await matchStorySnapshot(page, 'components-input--with-value', 'with-value', theme);
      });

      test('with-error', async ({ page }) => {
        await matchStorySnapshot(page, 'components-input--with-error', 'with-error', theme);
      });

      test('no-label', async ({ page }) => {
        await matchStorySnapshot(page, 'components-input--no-label', 'no-label', theme);
      });

      test('disabled', async ({ page }) => {
        await matchStorySnapshot(page, 'components-input--disabled', 'disabled', theme);
      });
    });
  });
}
