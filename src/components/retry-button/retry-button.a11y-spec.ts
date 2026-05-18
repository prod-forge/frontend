import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('RetryButton a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-retrybutton--default');
  });
});
