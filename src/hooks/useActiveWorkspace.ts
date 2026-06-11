import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformService, type WorkspaceInfo } from '../services/platform';
import { useWorkspaceStore } from '../store/workspaceStore';

export function useActiveWorkspace(enabled: boolean) {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId);

  const workspacesQuery = useQuery({
    queryKey: ['platform', 'workspaces'],
    queryFn: () => platformService.listWorkspaces(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const workspaces = useMemo(
    () => workspacesQuery.data?.items ?? [],
    [workspacesQuery.data?.items],
  );
  const activeWorkspace = useMemo<WorkspaceInfo | undefined>(() => {
    if (!workspaces.length) return undefined;
    return (
      workspaces.find((workspace) => workspace.public_id === activeWorkspaceId) ?? workspaces[0]
    );
  }, [activeWorkspaceId, workspaces]);
  const resolvedActiveWorkspaceId = activeWorkspace?.public_id;

  useEffect(() => {
    if (!enabled || !resolvedActiveWorkspaceId) return;
    if (resolvedActiveWorkspaceId !== activeWorkspaceId) {
      setActiveWorkspaceId(resolvedActiveWorkspaceId);
    }
  }, [activeWorkspaceId, enabled, resolvedActiveWorkspaceId, setActiveWorkspaceId]);

  const selectWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      await platformService.selectWorkspace(workspaceId);
      return workspaceId;
    },
    onSuccess: (workspaceId) => {
      setActiveWorkspaceId(workspaceId);
      void queryClient.invalidateQueries();
    },
  });

  return {
    activeWorkspace,
    activeWorkspaceId: resolvedActiveWorkspaceId ?? null,
    workspaces,
    isLoading: workspacesQuery.isLoading,
    selectWorkspace: selectWorkspaceMutation.mutate,
    isSelectingWorkspace: selectWorkspaceMutation.isPending,
  };
}
