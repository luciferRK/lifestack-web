import { beforeEach, describe, expect, it, vi } from 'vitest';

import api from './api';
import { exportsService } from './exports';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('exportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls create, get, download, and delete endpoints', async () => {
    (api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: {} });
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: new Blob(['{}'], { type: 'application/json' }),
      headers: { 'content-disposition': 'attachment; filename="lifestack-export.json"' },
    });
    (api.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await exportsService.createExport({ format: 'json', modules: ['todo', 'spending'] });
    await exportsService.getExport('exp_1');
    const download = await exportsService.downloadExport('exp_1');
    await exportsService.deleteExport('exp_1');

    expect(api.post).toHaveBeenCalledWith('/exports', {
      format: 'json',
      modules: ['todo', 'spending'],
    });
    expect(api.get).toHaveBeenNthCalledWith(1, '/exports/exp_1');
    expect(api.get).toHaveBeenNthCalledWith(2, '/exports/exp_1/download', {
      responseType: 'blob',
    });
    expect(download.filename).toBe('lifestack-export.json');
    expect(api.delete).toHaveBeenCalledWith('/exports/exp_1');
  });
});
