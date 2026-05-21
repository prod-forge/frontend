import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('ErrorBoundary a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-errorboundary--default');
  });

  test('error state', async ({ page }) => {
    await checkStoryA11y(page, 'components-errorboundary--error-state');
  });
});
