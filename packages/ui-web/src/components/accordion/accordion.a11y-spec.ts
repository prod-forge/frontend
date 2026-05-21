import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('Accordion a11y', () => {
  test('closed', async ({ page }) => {
    await checkStoryA11y(page, 'components-accordion--closed');
  });

  test('open', async ({ page }) => {
    await checkStoryA11y(page, 'components-accordion--open');
  });
});
