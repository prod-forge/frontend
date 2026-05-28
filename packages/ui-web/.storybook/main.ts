import type { StorybookConfig } from '@storybook/react-vite';
import type { UserConfig } from 'vite';

const config: StorybookConfig = {
  addons: ['@chromatic-com/storybook', '@storybook/addon-vitest', '@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  staticDirs: [{ from: '../../../assets', to: '/' }],
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  viteFinal(viteConfig): UserConfig {
    return {
      ...viteConfig,
      define: {
        ...viteConfig.define,
        'import.meta.env.VITE_ASSETS_BASE_URL': JSON.stringify(''),
      },
    };
  },
};
export default config;
