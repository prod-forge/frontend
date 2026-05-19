import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RegisterForm } from './register-form';

describe('RegisterForm', () => {
  it('renders email, name (optional), password and a "Create account" submit button', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toHaveAttribute('type', 'submit');
  });

  it('submits the form with all fields filled in', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText(/name/i), 'Anna');
    await user.type(screen.getByLabelText('Password'), 'pwd');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', name: 'Anna', password: 'pwd' });
  });

  it('submits without name (optional field)', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'pwd');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pwd' });
  });

  it('shows an error when email is missing', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Password'), 'pwd');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows an error when email format is invalid', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'invalid');
    await user.type(screen.getByLabelText('Password'), 'pwd');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
  });

  it('shows an error when password is shorter than 3 characters', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'ab');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
  });

  it('shows an error when password is longer than 20 characters', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'a'.repeat(21));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/20 characters or fewer/i)).toBeInTheDocument();
  });

  it('uses type="password" for the password input', () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });
});
