import type { Meta, StoryObj } from '@storybook/react-vite';
import type { JSX } from 'react';

import { ErrorBoundary } from './error-boundary';

const meta = {
  args: {
    children: '',
  },
  component: ErrorBoundary,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/ErrorBoundary',
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (): JSX.Element => (
    <ErrorBoundary>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>Application content renders here.</p>
    </ErrorBoundary>
  ),
};

const ThrowingChild = (): null => {
  throw new Error('Simulated render error');
};

export const ErrorState: Story = {
  render: (): JSX.Element => (
    <ErrorBoundary>
      <ThrowingChild />
    </ErrorBoundary>
  ),
};
