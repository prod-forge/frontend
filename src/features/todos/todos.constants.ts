import type { SelectOption } from '../../components/select/select';
import type { Order, SortBy } from './todos.types';

export const SORT_BY_OPTIONS: SelectOption<SortBy>[] = [
  {
    label: 'Title',
    value: 'title',
  },
  {
    label: 'Status',
    value: 'completed',
  },
];

export const ORDER_OPTIONS: SelectOption<Order>[] = [
  {
    label: 'Ascending',
    value: 'asc',
  },
  {
    label: 'Descending',
    value: 'desc',
  },
];

export const LIMIT_OPTIONS: SelectOption[] = [
  {
    label: '10',
    value: '10',
  },
  {
    label: '20',
    value: '20',
  },
  {
    label: '50',
    value: '50',
  },
];
