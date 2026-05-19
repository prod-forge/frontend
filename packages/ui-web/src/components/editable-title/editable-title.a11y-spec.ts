import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('EditableTitle a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-editabletitle--default');
  });

  test('long-title', async ({ page }) => {
    await checkStoryA11y(page, 'components-editabletitle--long-title');
  });

  test('custom-short-limit', async ({ page }) => {
    await checkStoryA11y(page, 'components-editabletitle--custom-short-limit');
  });
});
