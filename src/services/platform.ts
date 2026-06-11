import api from './api';

export interface WorkspaceInfo {
  public_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  role: string | null;
}

export interface DemoResetStatus {
  enabled: boolean;
  allowed: boolean;
  workspace_public_id: string;
  workspace_name: string;
  role: string | null;
  reason: string | null;
}

export const platformService = {
  listWorkspaces: async (): Promise<{ items: WorkspaceInfo[] }> => {
    const response = await api.get('/platform/workspaces/');
    return response.data as { items: WorkspaceInfo[] };
  },
  selectWorkspace: async (workspaceId: string): Promise<void> => {
    await api.post(`/platform/workspaces/${workspaceId}/select`);
  },
  getDemoResetStatus: async (workspaceId: string): Promise<DemoResetStatus> => {
    const response = await api.get(`/platform/workspaces/${workspaceId}/reset-demo/status`);
    return response.data as DemoResetStatus;
  },
  resetDemoData: async (workspaceId: string): Promise<{ status: string }> => {
    const response = await api.post(`/platform/workspaces/${workspaceId}/reset-demo`);
    return response.data as { status: string };
  },
};
