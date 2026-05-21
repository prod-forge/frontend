import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('Input a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-input--default');
  });

  test('with-value', async ({ page }) => {
    await checkStoryA11y(page, 'components-input--with-value');
  });

  test('with-error', async ({ page }) => {
    await checkStoryA11y(page, 'components-input--with-error');
  });

  test('no-label', async ({ page }) => {
    await checkStoryA11y(page, 'components-input--no-label');
  });

  test('disabled', async ({ page }) => {
    await checkStoryA11y(page, 'components-input--disabled');
  });
});
