import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('ErrorBlock a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-errorblock--default');
  });

  test('with action', async ({ page }) => {
    await checkStoryA11y(page, 'components-errorblock--with-action');
  });
});
