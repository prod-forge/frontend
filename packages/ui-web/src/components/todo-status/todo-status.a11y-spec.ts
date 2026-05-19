import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('TodoStatus a11y', () => {
  test('todo', async ({ page }) => {
    await checkStoryA11y(page, 'components-todostatus--todo');
  });

  test('done', async ({ page }) => {
    await checkStoryA11y(page, 'components-todostatus--done');
  });
});
