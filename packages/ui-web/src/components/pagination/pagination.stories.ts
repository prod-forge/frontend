import type { Meta, StoryObj } from '@storybook/react-vite';

import { Pagination } from './pagination';

const noop = (): void => undefined;

const meta = {
  component: Pagination,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Pagination',
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoPages: Story = {
  args: {
    limit: 10,
    offset: 0,
    onOffsetChange: noop,
    total: 15,
  },
};

export const ManyPages: Story = {
  args: {
    limit: 5,
    offset: 20,
    onOffsetChange: noop,
    total: 100,
  },
};

export const FirstPage: Story = {
  args: {
    limit: 10,
    offset: 0,
    onOffsetChange: noop,
    total: 200,
  },
};

export const LastPage: Story = {
  args: {
    limit: 10,
    offset: 190,
    onOffsetChange: noop,
    total: 200,
  },
};
