import type { RenderResult } from '@testing-library/react';
import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { Header } from './header';

const renderHeader = (props: Partial<ComponentProps<typeof Header>> = {}): RenderResult =>
  render(
    <MemoryRouter>
      <Header onToggle={props.onToggle ?? ((): void => undefined)} theme={props.theme ?? 'light'} {...props} />
    </MemoryRouter>,
  );

describe('Header', () => {
  it('renders the brand name', () => {
    renderHeader();

    expect(screen.getByRole('banner')).toHaveTextContent('TodoAI');
  });

  it('shows "Switch to dark mode" label when current theme is light', () => {
    renderHeader({ theme: 'light' });

    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it('shows "Switch to light mode" label when current theme is dark', () => {
    renderHeader({ theme: 'dark' });

    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it('calls onToggle when the theme button is clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    renderHeader({ onToggle });

    await user.click(screen.getByRole('button', { name: /switch to dark mode/i }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows Sign in / Sign up links when unauthenticated', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });

  it('shows the user identifier and a Sign out button when authenticated', () => {
    renderHeader({ isAuthenticated: true, user: { email: 'a@b.com', name: 'Anna' } });

    expect(screen.getByTestId('header-user')).toHaveTextContent('Anna');
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument();
  });

  it('falls back to email when user has no name', () => {
    renderHeader({ isAuthenticated: true, user: { email: 'a@b.com' } });

    expect(screen.getByTestId('header-user')).toHaveTextContent('a@b.com');
  });

  it('calls onLogout when Sign out is clicked', async () => {
    const onLogout = vi.fn();
    const user = userEvent.setup();
    renderHeader({ isAuthenticated: true, onLogout, user: { email: 'a@b.com' } });

    await user.click(screen.getByRole('button', { name: /sign out/i }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
