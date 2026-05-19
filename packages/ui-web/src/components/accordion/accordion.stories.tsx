import type { Meta, StoryObj } from '@storybook/react-vite';

import { Accordion } from './accordion';

const meta = {
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Accordion',
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: {
    children: <p>Hidden content. Click the trigger to reveal.</p>,
    title: 'Filters',
  },
};

export const Open: Story = {
  args: {
    children: <p>This content starts open.</p>,
    defaultOpen: true,
    title: 'Filters',
  },
};
