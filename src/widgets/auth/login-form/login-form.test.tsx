import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LoginForm } from './login-form';

const getLoginForm = (): HTMLElement => screen.getByRole('form', { name: /login form/i });

const getForgotForm = (): HTMLElement => screen.getByRole('form', { name: /forgot password form/i });

describe('LoginForm', () => {
  it('renders email and password inputs and a "Sign in" submit button', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    const form = getLoginForm();
    expect(within(form).getByLabelText('Email')).toBeInTheDocument();
    expect(within(form).getByLabelText('Password')).toBeInTheDocument();
    expect(within(form).getByRole('button', { name: /sign in/i })).toHaveAttribute('type', 'submit');
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

  it('renders a "Forgot password?" accordion that is collapsed by default', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /forgot password\?/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the forgot password accordion and submits the email', async () => {
    const onForgotPassword = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onForgotPassword={onForgotPassword} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /forgot password\?/i }));

    const form = getForgotForm();
    await user.type(within(form).getByLabelText('Email'), 'a@b.com');
    await user.click(within(form).getByRole('button', { name: /send reset link/i }));

    expect(onForgotPassword).toHaveBeenCalledWith({ email: 'a@b.com' });
    expect(form).toHaveTextContent(/if an account exists for a@b\.com/i);
  });

  it('shows an error in the forgot password form when email is invalid', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /forgot password\?/i }));
    const form = getForgotForm();
    await user.click(within(form).getByRole('button', { name: /send reset link/i }));

    expect(within(form).getByText(/email is required/i)).toBeInTheDocument();
  });

  it('uses type="password" for the password input', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(within(getLoginForm()).getByLabelText('Password')).toHaveAttribute('type', 'password');
  });
});
