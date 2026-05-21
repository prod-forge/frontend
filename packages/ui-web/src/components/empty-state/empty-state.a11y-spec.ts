import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('EmptyState a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-emptystate--default');
  });

  test('custom message', async ({ page }) => {
    await checkStoryA11y(page, 'components-emptystate--custom-message');
  });
});
