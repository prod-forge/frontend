import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('TodoList a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-todolist--default');
  });

  test('single-item', async ({ page }) => {
    await checkStoryA11y(page, 'components-todolist--single-item');
  });
});
