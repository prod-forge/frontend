import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LoginForm } from './login-form';

const getLoginForm = (): HTMLElement => screen.getByRole('form', { name: /login form/i });

describe('LoginForm', () => {
  describe('negative cases', () => {
    it('shows an error and does not submit when email is empty', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<LoginForm onSubmit={onSubmit} />);

      const form = getLoginForm();
      await user.type(within(form).getByLabelText('Password'), 'pwd');
      await user.click(within(form).getByRole('button', { name: /sign in/i }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(within(form).getByText(/email is required/i)).toBeInTheDocument();
    });

    it('shows an error when email is not a valid format', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<LoginForm onSubmit={onSubmit} />);

      const form = getLoginForm();
      await user.type(within(form).getByLabelText('Email'), 'not-an-email');
      await user.type(within(form).getByLabelText('Password'), 'pwd');
      await user.click(within(form).getByRole('button', { name: /sign in/i }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(within(form).getByText(/enter a valid email/i)).toBeInTheDocument();
    });

    it('shows an error when password is shorter than 3 characters', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<LoginForm onSubmit={onSubmit} />);

      const form = getLoginForm();
      await user.type(within(form).getByLabelText('Email'), 'a@b.com');
      await user.type(within(form).getByLabelText('Password'), 'ab');
      await user.click(within(form).getByRole('button', { name: /sign in/i }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(within(form).getByText(/at least 3 characters/i)).toBeInTheDocument();
    });

    it('shows an error when password is longer than 20 characters', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<LoginForm onSubmit={onSubmit} />);

      const form = getLoginForm();
      await user.type(within(form).getByLabelText('Email'), 'a@b.com');
      await user.type(within(form).getByLabelText('Password'), 'a'.repeat(21));
      await user.click(within(form).getByRole('button', { name: /sign in/i }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(within(form).getByText(/20 characters or fewer/i)).toBeInTheDocument();
    });

    it('does not offer a password reset, which the backend does not support', () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      expect(screen.queryByText(/forgot password/i)).not.toBeInTheDocument();
    });
  });

  describe('positive cases', () => {
    it('renders email and password inputs and a "Sign in" submit button', () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      const form = getLoginForm();
      expect(within(form).getByLabelText('Email')).toBeInTheDocument();
      expect(within(form).getByLabelText('Password')).toBeInTheDocument();
      expect(within(form).getByRole('button', { name: /sign in/i })).toHaveAttribute('type', 'submit');
    });

    it('uses type="password" for the password input', () => {
      render(<LoginForm onSubmit={vi.fn()} />);

      expect(within(getLoginForm()).getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('submits the form with valid credentials', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<LoginForm onSubmit={onSubmit} />);

      const form = getLoginForm();
      await user.type(within(form).getByLabelText('Email'), 'a@b.com');
      await user.type(within(form).getByLabelText('Password'), 'pwd');
      await user.click(within(form).getByRole('button', { name: /sign in/i }));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pwd' });
    });

    it('keeps the submit button disabled until the returned promise settles', async () => {
      let finish: () => void = () => undefined;
      const onSubmit = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
      const user = userEvent.setup();
      render(<LoginForm onSubmit={onSubmit} />);

      const form = getLoginForm();
      await user.type(within(form).getByLabelText('Email'), 'a@b.com');
      await user.type(within(form).getByLabelText('Password'), 'pwd');
      await user.click(within(form).getByRole('button', { name: /sign in/i }));

      expect(within(form).getByRole('button', { name: /sign in/i })).toBeDisabled();
      finish();
      await waitFor(() => expect(within(form).getByRole('button', { name: /sign in/i })).toBeEnabled());
    });
  });
});
