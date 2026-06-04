import api from './api';

export interface WorkspaceInfo {
  public_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  role: string | null;
}

export const platformService = {
  listWorkspaces: async (): Promise<{ items: WorkspaceInfo[] }> => {
    const response = await api.get('/platform/workspaces/');
    return response.data as { items: WorkspaceInfo[] };
  },
};
