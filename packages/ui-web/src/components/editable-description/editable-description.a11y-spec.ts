import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('EditableDescription a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-editabledescription--default');
  });

  test('empty', async ({ page }) => {
    await checkStoryA11y(page, 'components-editabledescription--empty');
  });

  test('multiline', async ({ page }) => {
    await checkStoryA11y(page, 'components-editabledescription--multiline');
  });

  test('required-and-short', async ({ page }) => {
    await checkStoryA11y(page, 'components-editabledescription--required-and-short');
  });
});
