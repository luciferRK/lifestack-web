/**
 * Central registry of TanStack Query key builders.
 *
 * All keys are `['module', 'resource', ...params]` so a mutation can
 * prefix-invalidate an entire module (`queryKeys.todo.all`) instead of
 * listing every resource key by hand, and so two unrelated features never
 * accidentally share a cache prefix (e.g. spending categories vs.
 * MasterConfigPage categories).
 *
 * `investing`, `finance`, `dashboard`, and `exports` already used this
 * shape before this file existed — they're included here for a single
 * import source, but their key *values* are unchanged.
 */
export const queryKeys = {
  todo: {
    all: ['todo'] as const,
    list: <T extends unknown[]>(...params: T) => ['todo', 'list', ...params] as const,
    recurring: <T extends unknown[]>(...params: T) => ['todo', 'recurring', ...params] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    summary: () => ['dashboard', 'summary'] as const,
  },
} as const;
