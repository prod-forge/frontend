import type { ReactNode } from 'react';

import { Link } from 'react-router-dom';

export const NotFound = (): ReactNode => (
  <div className="py-16 text-center">
    <h1 className="text-3xl font-semibold leading-tight tracking-[-0.03em] text-fg">Page not found</h1>
    <p className="mt-2 text-md text-fg-soft">The address does not match any page.</p>
    <Link className="mt-4 inline-block font-medium text-brand hover:underline" to="/">
      Go back to home
    </Link>
  </div>
);
