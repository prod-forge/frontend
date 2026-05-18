import { test } from '@playwright/test';

import { matchStorySnapshot, themes } from '../../../visual-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('Button visual', () => {
      test('primary', async ({ page }) => {
        await matchStorySnapshot(page, 'components-button--primary', 'primary', theme);
      });

      test('secondary', async ({ page }) => {
        await matchStorySnapshot(page, 'components-button--secondary', 'secondary', theme);
      });

      test('ghost', async ({ page }) => {
        await matchStorySnapshot(page, 'components-button--ghost', 'ghost', theme);
      });

      test('danger', async ({ page }) => {
        await matchStorySnapshot(page, 'components-button--danger', 'danger', theme);
      });

      test('small', async ({ page }) => {
        await matchStorySnapshot(page, 'components-button--small', 'small', theme);
      });

      test('large', async ({ page }) => {
        await matchStorySnapshot(page, 'components-button--large', 'large', theme);
      });

      test('disabled', async ({ page }) => {
        await matchStorySnapshot(page, 'components-button--disabled', 'disabled', theme);
      });
    });
  });
}
