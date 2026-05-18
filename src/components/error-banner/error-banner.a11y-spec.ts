import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('ErrorBanner a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-errorbanner--default');
  });

  test('long message', async ({ page }) => {
    await checkStoryA11y(page, 'components-errorbanner--long-message');
  });
});
