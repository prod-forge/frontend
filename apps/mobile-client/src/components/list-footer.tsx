import type { ReactNode } from 'react';

import { Preloader } from './preloader';
import { PrimaryButton } from './primary-button';

type ListFooterProps = {
  readonly hasMore: boolean;
  readonly isLoading: boolean;
  readonly onLoadMore: () => void;
};

export const ListFooter = ({ hasMore, isLoading, onLoadMore }: ListFooterProps): ReactNode => {
  if (isLoading) {
    return <Preloader />;
  }

  return hasMore ? <PrimaryButton onPress={onLoadMore} title="Load more" variant="secondary" /> : null;
};
