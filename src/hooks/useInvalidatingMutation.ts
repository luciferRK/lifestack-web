import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Wraps useMutation and invalidates the given query keys on success.
 * Collapses the "mutate, then invalidate N query keys" boilerplate repeated
 * across page components into one call.
 */
export function useInvalidatingMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  invalidateKeys: readonly (readonly unknown[])[],
  options?: { onSuccess?: (result: TResult) => void; onError?: (error: unknown) => void },
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (result: TResult) => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [...key] }));
      options?.onSuccess?.(result);
    },
    onError: options?.onError,
  });
}
