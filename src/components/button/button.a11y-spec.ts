import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('Button a11y', () => {
  test('primary', async ({ page }) => {
    await checkStoryA11y(page, 'components-button--primary');
  });

  test('secondary', async ({ page }) => {
    await checkStoryA11y(page, 'components-button--secondary');
  });

  test('ghost', async ({ page }) => {
    await checkStoryA11y(page, 'components-button--ghost');
  });

  test('danger', async ({ page }) => {
    await checkStoryA11y(page, 'components-button--danger');
  });

  test('small', async ({ page }) => {
    await checkStoryA11y(page, 'components-button--small');
  });

  test('large', async ({ page }) => {
    await checkStoryA11y(page, 'components-button--large');
  });

  test('disabled', async ({ page }) => {
    await checkStoryA11y(page, 'components-button--disabled');
  });
});
