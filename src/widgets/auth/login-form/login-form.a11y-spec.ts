import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../../a11y-tests/helpers';

test.describe('LoginForm a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'widgets-loginform--default');
  });
});
