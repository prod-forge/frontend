import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Select } from './select';

const options = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Done', value: 'done' },
];

describe('Select', () => {
  it('renders all options', () => {
    render(
      <Select
        id="filter"
        onChange={() => {
          /* empty */
        }}
        options={options}
        value="all"
      />,
    );

    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Active' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Done' })).toBeInTheDocument();
  });

  it('reflects the selected value', () => {
    render(
      <Select
        id="filter"
        onChange={() => {
          /* empty */
        }}
        options={options}
        value="active"
      />,
    );

    expect(screen.getByRole('combobox')).toHaveValue('active');
  });

  it('renders a label when provided and links it to the select', () => {
    render(
      <Select
        id="filter"
        label="Status"
        onChange={() => {
          /* empty */
        }}
        options={options}
        value="all"
      />,
    );

    expect(screen.getByLabelText('Status')).toBe(screen.getByRole('combobox'));
  });

  it('omits the label when not provided', () => {
    render(
      <Select
        id="filter"
        onChange={() => {
          /* empty */
        }}
        options={options}
        value="all"
      />,
    );

    expect(screen.queryByText('Status')).not.toBeInTheDocument();
  });

  it('calls onChange with the new value when a different option is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Select id="filter" onChange={onChange} options={options} value="all" />);

    await user.selectOptions(screen.getByRole('combobox'), 'done');

    expect(onChange).toHaveBeenCalledWith('done');
  });
});
