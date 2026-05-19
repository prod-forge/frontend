import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from './pagination';

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(
      <Pagination
        limit={10}
        offset={0}
        onOffsetChange={() => {
          /* empty */
        }}
        total={5}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders prev/next when there are multiple pages', () => {
    render(
      <Pagination
        limit={10}
        offset={0}
        onOffsetChange={() => {
          /* empty */
        }}
        total={50}
      />,
    );

    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
  });

  it('disables Prev on the first page', () => {
    render(
      <Pagination
        limit={10}
        offset={0}
        onOffsetChange={() => {
          /* empty */
        }}
        total={50}
      />,
    );

    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).toBeEnabled();
  });

  it('disables Next on the last page', () => {
    render(
      <Pagination
        limit={10}
        offset={40}
        onOffsetChange={() => {
          /* empty */
        }}
        total={50}
      />,
    );

    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeEnabled();
  });

  it('marks the current page with aria-current="page"', () => {
    render(
      <Pagination
        limit={10}
        offset={20}
        onOffsetChange={() => {
          /* empty */
        }}
        total={50}
      />,
    );

    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current');
  });

  it('calls onOffsetChange with the new offset when a page button is clicked', async () => {
    const onOffsetChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination limit={10} offset={0} onOffsetChange={onOffsetChange} total={50} />);

    await user.click(screen.getByRole('button', { name: 'Page 2' }));

    expect(onOffsetChange).toHaveBeenCalledWith(10);
  });

  it('moves to the next page when Next is clicked', async () => {
    const onOffsetChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination limit={10} offset={0} onOffsetChange={onOffsetChange} total={50} />);

    await user.click(screen.getByRole('button', { name: /next page/i }));

    expect(onOffsetChange).toHaveBeenCalledWith(10);
  });

  it('moves to the previous page when Prev is clicked', async () => {
    const onOffsetChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination limit={10} offset={20} onOffsetChange={onOffsetChange} total={50} />);

    await user.click(screen.getByRole('button', { name: /previous page/i }));

    expect(onOffsetChange).toHaveBeenCalledWith(10);
  });

  it('renders an ellipsis when there is a gap between pages', () => {
    render(
      <Pagination
        limit={10}
        offset={50}
        onOffsetChange={() => {
          /* empty */
        }}
        total={200}
      />,
    );

    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
  });
});
