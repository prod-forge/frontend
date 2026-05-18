import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('Modal a11y', () => {
  test('open', async ({ page }) => {
    await checkStoryA11y(page, 'components-modal--open');
  });

  test('title-only', async ({ page }) => {
    await checkStoryA11y(page, 'components-modal--title-only');
  });

  test('with-footer', async ({ page }) => {
    await checkStoryA11y(page, 'components-modal--with-footer');
  });
});
