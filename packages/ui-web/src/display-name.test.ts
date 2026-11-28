import { describe, expect, it } from 'vitest';

import * as ui from './index';

// Every component exported from the package sets displayName the same way
// as button.tsx, so it shows up with its name in React DevTools and in
// Storybook. useTheme is a hook, not a component, so it is skipped.
describe('displayName', () => {
  for (const [name, component] of Object.entries(ui)) {
    if (name === 'useTheme') {
      continue;
    }

    it('sets displayName on ' + name, () => {
      const displayName = (component as { displayName?: string }).displayName;

      expect(displayName).toBe(name);
    });
  }
});
