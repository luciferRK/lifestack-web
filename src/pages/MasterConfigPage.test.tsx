import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';

import { MasterConfigPage } from './MasterConfigPage';
import { server } from '../test/setup';
import { useWorkspaceStore } from '../store/workspaceStore';

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe('MasterConfigPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkspaceStore.getState().clearActiveWorkspace();
  });

  it('resets the active workspace rather than the first workspace in the list', async () => {
    const workspaceA = '11111111-1111-1111-1111-111111111111';
    const workspaceB = '22222222-2222-2222-2222-222222222222';
    let resetTarget: string | null = null;

    useWorkspaceStore.getState().setActiveWorkspaceId(workspaceB);

    server.use(
      http.get('*/v1/platform/workspaces/', () =>
        HttpResponse.json({
          items: [
            {
              public_id: workspaceA,
              name: 'Alpha Workspace',
              description: null,
              is_active: true,
              role: 'owner',
            },
            {
              public_id: workspaceB,
              name: 'Beta Workspace',
              description: null,
              is_active: true,
              role: 'owner',
            },
          ],
        }),
      ),
      http.get(`*/v1/platform/workspaces/${workspaceB}/reset-demo/status`, () =>
        HttpResponse.json({
          enabled: true,
          allowed: true,
          workspace_public_id: workspaceB,
          workspace_name: 'Beta Workspace',
          role: 'owner',
          reason: null,
        }),
      ),
      http.get('*/v1/finance/currencies', () =>
        HttpResponse.json([
          { code: 'USD', name: 'US Dollar', symbol: '$', minor_unit: 2, is_active: true },
        ]),
      ),
      http.get('*/v1/finance/accounts', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/finance/settings', () =>
        HttpResponse.json({
          reporting_currency_code: null,
          currency_display_preference: 'symbol',
          updated_at: '2026-06-10T00:00:00Z',
        }),
      ),
      http.get('*/v1/finance/settings/user', () =>
        HttpResponse.json({
          reporting_currency_override_code: null,
          currency_display_preference_override: null,
          workspace_reporting_currency_code: null,
          workspace_currency_display_preference: 'symbol',
          effective_reporting_currency_code: null,
          effective_currency_display_preference: 'symbol',
          updated_at: '2026-06-10T00:00:00Z',
        }),
      ),
      http.get('*/v1/spending/categories', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.post('*/v1/platform/workspaces/:workspaceId/reset-demo', ({ params }) => {
        resetTarget = String(params.workspaceId);
        return HttpResponse.json({ status: 'reset_success' });
      }),
    );

    renderWithQuery(<MasterConfigPage />);

    expect(await screen.findByText('Beta Workspace')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('master-demo-reset-button'));

    const confirmButton = screen.getByRole('button', { name: 'Reset & Seed' });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(screen.getByTestId('master-demo-reset-confirmation'), {
      target: { value: 'Beta Workspace' },
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(resetTarget).toBe(workspaceB);
    });
  });
});
