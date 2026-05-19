import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Input } from './input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input id="x" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('associates the label with the input via htmlFor/id', () => {
    render(<Input id="title" label="Title" />);

    expect(screen.getByLabelText('Title')).toHaveAttribute('id', 'title');
  });

  it('renders without a label when none is provided', () => {
    render(<Input id="anon" />);

    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('exposes the error message via role="alert" and links it via aria-describedby', () => {
    render(<Input error="Required field" id="t" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Required field');
    expect(input).toHaveAttribute('aria-describedby', alert.id);
  });

  it('does not render an alert when there is no error', () => {
    render(<Input id="t" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('forwards typing events to onChange', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input id="t" onChange={onChange} />);

    await user.type(screen.getByRole('textbox'), 'ab');

    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('forwards refs to the underlying input element', () => {
    let element: HTMLInputElement | null = null;
    render(
      <Input
        id="t"
        ref={(node) => {
          element = node;
        }}
      />,
    );

    expect(element).toBeInstanceOf(HTMLInputElement);
  });

  it('applies error-styled classes when an error is present', () => {
    render(<Input error="Bad" id="t" />);

    expect(screen.getByRole('textbox').className).toContain('border-err');
  });

  it('applies default classes when no error', () => {
    render(<Input id="t" />);

    expect(screen.getByRole('textbox').className).toContain('border-line');
  });

  it('passes through arbitrary HTML attributes (placeholder, name, type)', () => {
    render(<Input id="t" name="email" placeholder="you@example.com" type="email" />);

    const input = screen.getByPlaceholderText('you@example.com');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('type', 'email');
  });
});
