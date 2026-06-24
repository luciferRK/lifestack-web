import { z } from 'zod';
import api from './api';

export const WorkspaceInfoSchema = z.object({
  public_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  role: z.string().nullable(),
});

export type WorkspaceInfo = z.infer<typeof WorkspaceInfoSchema>;

export const DemoResetStatusSchema = z.object({
  enabled: z.boolean(),
  allowed: z.boolean(),
  workspace_public_id: z.string(),
  workspace_name: z.string(),
  role: z.string().nullable(),
  reason: z.string().nullable(),
});

export type DemoResetStatus = z.infer<typeof DemoResetStatusSchema>;

const ListWorkspacesResponseSchema = z.object({
  items: z.array(WorkspaceInfoSchema),
});

const ResetDemoResponseSchema = z.object({
  status: z.string(),
});

export const platformService = {
  listWorkspaces: async (): Promise<{ items: WorkspaceInfo[] }> => {
    const response = await api.get('/platform/workspaces/');
    return ListWorkspacesResponseSchema.parse(response.data);
  },
  selectWorkspace: async (workspaceId: string): Promise<void> => {
    await api.post(`/platform/workspaces/${workspaceId}/select`);
  },
  getDemoResetStatus: async (workspaceId: string): Promise<DemoResetStatus> => {
    const response = await api.get(`/platform/workspaces/${workspaceId}/reset-demo/status`);
    return DemoResetStatusSchema.parse(response.data);
  },
  resetDemoData: async (workspaceId: string): Promise<{ status: string }> => {
    const response = await api.post(`/platform/workspaces/${workspaceId}/reset-demo`);
    return ResetDemoResponseSchema.parse(response.data);
  },
};
