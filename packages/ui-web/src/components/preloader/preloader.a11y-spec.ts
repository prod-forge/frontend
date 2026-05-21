import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('Preloader a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-preloader--default');
  });

  test('in container', async ({ page }) => {
    await checkStoryA11y(page, 'components-preloader--in-container');
  });
});
