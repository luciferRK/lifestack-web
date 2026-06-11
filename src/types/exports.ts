export type ExportFormat = 'json' | 'csv';
export type ExportStatus = 'pending' | 'ready' | 'failed' | 'expired';
export type ExportModule = 'todo' | 'spending' | 'investing';

export interface ExportCreate {
  format: ExportFormat;
  modules: ExportModule[];
}

export interface ExportRecord {
  public_id: string;
  workspace_id: number;
  requested_by: number;
  format: ExportFormat;
  schema_version: number;
  scope: Record<string, unknown>;
  status: ExportStatus;
  storage_key: string | null;
  artifact_mime_type: string | null;
  artifact_filename: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface ExportDownload {
  blob: Blob;
  filename: string;
}
