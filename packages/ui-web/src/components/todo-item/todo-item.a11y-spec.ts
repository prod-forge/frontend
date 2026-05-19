import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('TodoItem a11y', () => {
  test('todo', async ({ page }) => {
    await checkStoryA11y(page, 'components-todoitem--todo');
  });

  test('done', async ({ page }) => {
    await checkStoryA11y(page, 'components-todoitem--done');
  });

  test('long-title', async ({ page }) => {
    await checkStoryA11y(page, 'components-todoitem--long-title');
  });
});
