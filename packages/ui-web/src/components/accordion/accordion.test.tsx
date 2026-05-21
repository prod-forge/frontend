import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Accordion } from './accordion';

describe('Accordion', () => {
  it('renders the title', () => {
    render(
      <Accordion title="More info">
        <p>Content</p>
      </Accordion>,
    );

    expect(screen.getByRole('button', { name: /more info/i })).toBeInTheDocument();
  });

  it('is collapsed by default', () => {
    render(
      <Accordion title="Section">
        <p>Hidden content</p>
      </Accordion>,
    );

    expect(screen.getByRole('button', { name: /section/i })).toHaveAttribute('aria-expanded', 'false');
  });

  it('respects defaultOpen', () => {
    render(
      <Accordion defaultOpen title="Section">
        <p>Visible content</p>
      </Accordion>,
    );

    expect(screen.getByRole('button', { name: /section/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles open and closed when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Accordion title="Section">
        <p>Content body</p>
      </Accordion>,
    );

    const button = screen.getByRole('button', { name: /section/i });

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('connects the button to the panel via aria-controls', () => {
    render(
      <Accordion title="Section">
        <p>Content</p>
      </Accordion>,
    );

    const button = screen.getByRole('button', { name: /section/i });
    const region = screen.getByRole('region', { hidden: true });

    expect(button.getAttribute('aria-controls')).toBe(region.getAttribute('id'));
  });
});
