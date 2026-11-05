// Loaded from index.html before main.tsx: sets the theme before React renders, so dark mode does not flash light.
// It is a module file rather than an inline script because the CSP allows only 'self' scripts.
const stored = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

document.documentElement.dataset.theme =
  stored === 'dark' || stored === 'light' ? stored : prefersDark ? 'dark' : 'light';

// A module, so that TypeScript and the unit test can import it.
export {};
