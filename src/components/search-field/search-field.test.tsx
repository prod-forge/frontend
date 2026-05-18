import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SearchField } from './search-field';

describe('SearchField', () => {
  it('renders an input with the given value', () => {
    render(
      <SearchField
        id="search"
        onChange={() => {
          /* empty */
        }}
        value="hello"
      />,
    );

    expect(screen.getByRole('searchbox')).toHaveValue('hello');
  });

  it('renders the placeholder when provided', () => {
    render(
      <SearchField
        id="search"
        onChange={() => {
          /* empty */
        }}
        placeholder="Search todos"
        value=""
      />,
    );

    expect(screen.getByPlaceholderText('Search todos')).toBeInTheDocument();
  });

  it('calls onChange with the new value when the user types', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchField id="search" onChange={onChange} value="" />);

    await user.type(screen.getByRole('searchbox'), 'abc');

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, 'a');
    expect(onChange).toHaveBeenNthCalledWith(2, 'b');
    expect(onChange).toHaveBeenNthCalledWith(3, 'c');
  });

  it('uses the provided id', () => {
    render(
      <SearchField
        id="my-search"
        onChange={() => {
          /* empty */
        }}
        value=""
      />,
    );

    expect(screen.getByRole('searchbox')).toHaveAttribute('id', 'my-search');
  });
});
