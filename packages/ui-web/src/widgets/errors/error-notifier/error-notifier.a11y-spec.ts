import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../../a11y-tests/helpers';

test.describe('ErrorNotifier a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'widgets-errors-errornotifier--default');
  });

  test('with error', async ({ page }) => {
    await checkStoryA11y(page, 'widgets-errors-errornotifier--with-error');
  });

  test('multiple errors', async ({ page }) => {
    await checkStoryA11y(page, 'widgets-errors-errornotifier--multiple-errors');
  });
});
