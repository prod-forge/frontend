import type { Meta, StoryObj } from '@storybook/react-vite';

import { SearchField } from './search-field';

const meta = {
  component: SearchField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/SearchField',
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = (): void => undefined;

export const Empty: Story = {
  args: {
    id: 'search-empty',
    onChange: noop,
    placeholder: 'Search tasks…',
    value: '',
  },
};

export const WithQuery: Story = {
  args: {
    id: 'search-with-query',
    onChange: noop,
    placeholder: 'Search tasks…',
    value: 'design system',
  },
};
