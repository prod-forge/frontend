import type { Meta, StoryObj } from '@storybook/react-vite';

import { Preloader } from './preloader';

const meta = {
  component: Preloader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Components/Preloader',
} satisfies Meta<typeof Preloader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InContainer: Story = {
  render: () => (
    <div className="w-80 rounded-xl border border-line bg-card">
      <Preloader />
    </div>
  ),
};
