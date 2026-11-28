import { test } from '@playwright/test';

import { checkStoryA11y, themes } from '../../../a11y-tests/helpers';

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.describe('Button a11y', () => {
      test('primary', async ({ page }) => {
        await checkStoryA11y(page, 'components-button--primary', theme);
      });

      test('secondary', async ({ page }) => {
        await checkStoryA11y(page, 'components-button--secondary', theme);
      });

      test('ghost', async ({ page }) => {
        await checkStoryA11y(page, 'components-button--ghost', theme);
      });

      test('danger', async ({ page }) => {
        await checkStoryA11y(page, 'components-button--danger', theme);
      });

      test('small', async ({ page }) => {
        await checkStoryA11y(page, 'components-button--small', theme);
      });

      test('large', async ({ page }) => {
        await checkStoryA11y(page, 'components-button--large', theme);
      });

      test('disabled', async ({ page }) => {
        await checkStoryA11y(page, 'components-button--disabled', theme);
      });
    });
  });
}
