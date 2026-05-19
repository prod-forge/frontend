import type { Decorator, Preview } from '@storybook/react-vite';

import { MemoryRouter } from 'react-router-dom';
import '@prod-forge-todolist-frontend/design-tokens/global.css';

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals['theme'] as string) ?? 'light';
  document.documentElement.setAttribute('data-theme', theme);

  return <Story />;
};

const withRouter: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const preview: Preview = {
  decorators: [withTheme, withRouter],
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        dynamicTitle: true,
        icon: 'circlehollow',
        items: [
          { icon: 'sun', title: 'Light', value: 'light' },
          { icon: 'moon', title: 'Dark', value: 'dark' },
        ],
        title: 'Theme',
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    a11y: {
      config: {
        rules: [],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'],
        },
      },
      test: 'error',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
