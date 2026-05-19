import type { TodosResponse } from '../../interfaces/todos';

export const todos: TodosResponse = {
  data: [
    {
      completed: true,
      description:
        'Set up CSS custom properties (design tokens) for the entire project. Define a color palette with semantic names, spacing scale, typography scale, border-radius tokens, and shadow tokens. Both light and dark themes must be supported out of the box using a data-theme attribute.',
      id: 'dd5aea6d-be47-47c0-aa45-6caecc1ab74b',
      title: 'Design system setup',
    },
    {
      completed: false,
      description:
        'Integrate React Router into the project. Create a root router with the home route displaying the todo list and a detail route for individual todos. Wrap all routes in a shared Layout component that provides the header and theme toggle.',
      id: '3c04db07-cec4-4abd-9895-5a887a1a2055',
      title: 'Implement routing',
    },
    {
      completed: false,
      description:
        'Evaluate and integrate a state management solution. Consider Zustand for its simplicity or React Query if server state becomes important. Define the todo data model and implement CRUD operations with optimistic updates.',
      id: '6a6dca31-8e99-47b2-aec5-15bfe492e6a5',
      title: 'State management',
    },
    {
      completed: false,
      description:
        'Build a form to create and edit todos. The form should include title, description, and status fields with proper validation and accessible error states. Support keyboard navigation and screen readers.',
      id: '03d8794d-cb14-4140-a667-72914dda1072',
      title: 'Add / edit todo form',
    },
    {
      completed: false,
      description:
        'Set up Vitest and React Testing Library. Write unit tests for custom hooks and integration tests for key user flows: creating a todo, marking it as done, and navigating to the detail view.',
      id: '13bf1194-de19-4e31-b839-7c9a9936eae2',
      title: 'Write unit & integration tests',
    },
    {
      completed: true,
      description:
        'Configure ESLint with the typescript-eslint plugin and Prettier. Add lint-staged and a pre-commit hook so formatting and linting run automatically on staged files before each commit.',
      id: '813a4202-bcc0-482b-8094-f34b438317c1',
      title: 'Lint & format pipeline',
    },
    {
      completed: true,
      description:
        'Install Storybook and create stories for the existing UI components. Wire up the design tokens so stories render with the same theming as the application, including a toolbar toggle for light and dark themes.',
      id: '5e1331b1-eb0b-43e8-b9fc-d238d9cf252e',
      title: 'Storybook integration',
    },
    {
      completed: false,
      description:
        'Add a search input and status filter to the home page. Filtering should be debounced, reflected in the URL query string, and preserved when navigating to a todo detail and back.',
      id: '951a703b-d050-4402-a7e5-0e4aed0e5208',
      title: 'Search and filtering',
    },
    {
      completed: false,
      description:
        'Persist todos to localStorage so the list survives page reloads. Implement a small storage adapter that can later be swapped for a real API client without changing call sites.',
      id: '2cd4ecab-2ed9-4b06-9f65-a878adb6cb0c',
      title: 'Persist todos to localStorage',
    },
    {
      completed: false,
      description:
        'Implement drag-and-drop reordering of todos on the home page using dnd-kit. Persist the order alongside the todo data and ensure keyboard-only users can reorder via accessible controls.',
      id: 'e0cf7b00-f804-425b-b751-f193d6ae7377',
      title: 'Drag-and-drop reordering',
    },
    {
      completed: false,
      description:
        'Add internationalization with i18next. Extract all user-facing strings to translation files and provide English and Ukrainian locales. Detect the user language from the browser and persist their choice.',
      id: '6dc9da63-2ed1-4382-9f28-d0d97a8f08ad',
      title: 'Internationalization (i18n)',
    },
    {
      completed: false,
      description:
        'Run an accessibility audit with axe-core. Fix any violations in color contrast, focus management, ARIA usage, and keyboard navigation. Add automated a11y assertions to the test suite.',
      id: '2173b329-2351-470f-af7b-fc00d7028353',
      title: 'Accessibility audit',
    },
    {
      completed: false,
      description:
        'Set up GitHub Actions with jobs for type-checking, linting, unit tests, and a production build. Cache dependencies between runs and surface build artifacts as workflow outputs.',
      id: '88033df7-624b-4705-ab73-439cf5221202',
      title: 'CI pipeline',
    },
    {
      completed: false,
      description:
        'Configure Vercel deployment with separate preview environments for each pull request and a production environment for the main branch. Add status checks to block merges on failed deployments.',
      id: 'f606216a-df34-4621-ae1f-05efaa012131',
      title: 'Deploy previews to Vercel',
    },
    {
      completed: false,
      description:
        'Audit and trim the production bundle. Configure route-based code splitting, lazy-load the detail page, and add a bundle size budget enforced in CI to prevent regressions.',
      id: '9f00193f-0c25-4003-bca9-cbef33e26d6f',
      title: 'Bundle size optimization',
    },
  ],
  meta: {
    limit: 10,
    offset: 0,
    total: 15,
  },
};
