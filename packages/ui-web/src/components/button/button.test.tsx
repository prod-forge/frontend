import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('defaults to type="button" so it does not submit forms unintentionally', () => {
    render(<Button>Default</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('uses the provided type when specified', () => {
    render(<Button type="submit">Submit</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Go</Button>);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );

    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies the correct classes for the primary variant', () => {
    render(<Button variant="primary">P</Button>);

    expect(screen.getByRole('button').className).toContain('bg-brand');
  });

  it('applies the correct classes for the secondary variant', () => {
    render(<Button variant="secondary">S</Button>);

    expect(screen.getByRole('button').className).toContain('bg-card');
  });

  it('applies the correct classes for the danger variant', () => {
    render(<Button variant="danger">D</Button>);

    expect(screen.getByRole('button').className).toContain('bg-err');
  });

  it('applies size-specific classes', () => {
    const { rerender } = render(<Button size="sm">Sm</Button>);
    expect(screen.getByRole('button').className).toContain('min-h-8');

    rerender(<Button size="lg">Lg</Button>);
    expect(screen.getByRole('button').className).toContain('min-h-11');
  });

  it('merges custom className with built-in classes', () => {
    render(<Button className="custom-class">X</Button>);

    expect(screen.getByRole('button').className).toContain('custom-class');
  });

  it('forwards refs to the underlying button element', () => {
    let element: HTMLButtonElement | null = null;
    render(
      <Button
        ref={(node) => {
          element = node;
        }}
      >
        R
      </Button>,
    );

    expect(element).toBeInstanceOf(HTMLButtonElement);
  });
});
