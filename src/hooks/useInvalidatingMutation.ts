import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Wraps useMutation and invalidates the given query keys on success.
 * Collapses the "mutate, then invalidate N query keys" boilerplate repeated
 * across page components into one call.
 */
export function useInvalidatingMutation<TArgs = void, TResult = unknown>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  invalidateKeys: readonly (readonly unknown[])[],
  options?: { onSuccess?: (result: TResult) => void; onError?: (error: unknown) => void },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (result: TResult) => {
      // One key's invalidation failing must not skip the rest.
      for (const key of [...invalidateKeys]) {
        try {
          queryClient.invalidateQueries({ queryKey: [...key] });
        } catch (error) {
          console.error('useInvalidatingMutation: failed to invalidate query key', key, error);
        }
      }
      options?.onSuccess?.(result);
    },
    onError: options?.onError,
  });
}
