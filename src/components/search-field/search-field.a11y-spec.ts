import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('SearchField a11y', () => {
  test('empty', async ({ page }) => {
    await checkStoryA11y(page, 'components-searchfield--empty');
  });

  test('with-query', async ({ page }) => {
    await checkStoryA11y(page, 'components-searchfield--with-query');
  });
});
