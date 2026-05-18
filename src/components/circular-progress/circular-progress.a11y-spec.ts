import { test } from '@playwright/test';

import { checkStoryA11y } from '../../../a11y-tests/helpers';

test.describe('CircularProgress a11y', () => {
  test('default', async ({ page }) => {
    await checkStoryA11y(page, 'components-circularprogress--default');
  });

  test('with children', async ({ page }) => {
    await checkStoryA11y(page, 'components-circularprogress--with-children');
  });

  test('empty', async ({ page }) => {
    await checkStoryA11y(page, 'components-circularprogress--empty');
  });

  test('full', async ({ page }) => {
    await checkStoryA11y(page, 'components-circularprogress--full');
  });

  test('sm', async ({ page }) => {
    await checkStoryA11y(page, 'components-circularprogress--sm');
  });

  test('md', async ({ page }) => {
    await checkStoryA11y(page, 'components-circularprogress--md');
  });

  test('lg', async ({ page }) => {
    await checkStoryA11y(page, 'components-circularprogress--lg');
  });
});
