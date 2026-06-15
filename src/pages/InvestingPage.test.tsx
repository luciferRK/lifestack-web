import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';

import { InvestingPage } from './InvestingPage';
import { server } from '../test/setup';

const renderWithQuery = (ui: React.ReactNode) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('InvestingPage', () => {
  it('shows valuation status and N/A totals for multi-currency unconverted summary', async () => {
    server.use(
      http.get('*/v1/investing/holdings', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/investing/cash-balances', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/finance/accounts', () =>
        HttpResponse.json({
          items: [
            {
              public_id: '11111111-1111-1111-1111-111111111111',
              name: 'Brokerage A',
              account_type: 'brokerage',
              default_currency_code: 'USD',
              is_active: true,
              created_at: '2026-05-24T00:00:00Z',
              updated_at: '2026-05-24T00:00:00Z',
            },
          ],
          total: 1,
          limit: 200,
          offset: 0,
        }),
      ),
      http.get('*/v1/finance/currencies', () =>
        HttpResponse.json([
          { code: 'USD', name: 'US Dollar', symbol: '$', minor_unit: 2, is_active: true },
          { code: 'INR', name: 'Indian Rupee', symbol: 'Rs', minor_unit: 2, is_active: true },
          { code: 'GBP', name: 'Pound Sterling', symbol: '£', minor_unit: 2, is_active: true },
        ]),
      ),
      http.get('*/v1/finance/settings/user', () =>
        HttpResponse.json({
          reporting_currency_override_code: null,
          currency_display_preference_override: null,
          workspace_reporting_currency_code: 'USD',
          workspace_currency_display_preference: 'symbol',
          effective_reporting_currency_code: 'USD',
          effective_currency_display_preference: 'symbol',
          updated_at: '2026-05-24T00:00:00Z',
        }),
      ),
      http.get('*/v1/investing/summary', () =>
        HttpResponse.json({
          portfolio_value: null,
          holdings_count: 2,
          cash_total: null,
          currency_breakdown: { USD: '2500.00', GBP: '1000.00' },
          daily_change: null,
          reporting_currency: null,
          valuation_status: 'multi_currency_unconverted',
        }),
      ),
      http.get('*/v1/investing/performance/summary', () =>
        HttpResponse.json({
          total_value: '0',
          total_cost: '0',
          total_gain_loss: '0',
          total_gain_loss_pct: '0',
          snapshot_date: '2026-05-24',
          currency: 'USD',
        }),
      ),
      http.get('*/v1/investing/instruments', () => HttpResponse.json([])),
    );

    renderWithQuery(<InvestingPage />);

    expect(await screen.findByText('Investing')).toBeInTheDocument();
    const naValues = await screen.findAllByText('N/A');
    expect(naValues.length).toBeGreaterThan(0);
    expect(screen.getByText(/Multiple currencies detected/)).toBeInTheDocument();
    expect(screen.getByText('Not configured')).toBeInTheDocument();
  });

  it('creates an account and submits a holding using selected account/currency', async () => {
    let accountList = {
      items: [] as Array<{
        public_id: string;
        name: string;
        account_type: 'bank' | 'brokerage' | 'wallet' | 'card' | 'gift_card';
        default_currency_code: string;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>,
      total: 0,
      limit: 200,
      offset: 0,
    };
    let holdingPayload: Record<string, unknown> | null = null;

    server.use(
      http.get('*/v1/investing/holdings', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/investing/cash-balances', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/finance/accounts', () => HttpResponse.json(accountList)),
      http.get('*/v1/finance/currencies', () =>
        HttpResponse.json([
          { code: 'USD', name: 'US Dollar', symbol: '$', minor_unit: 2, is_active: true },
          { code: 'INR', name: 'Indian Rupee', symbol: 'Rs', minor_unit: 2, is_active: true },
          { code: 'GBP', name: 'Pound Sterling', symbol: '£', minor_unit: 2, is_active: true },
        ]),
      ),
      http.get('*/v1/finance/settings/user', () =>
        HttpResponse.json({
          reporting_currency_override_code: null,
          currency_display_preference_override: null,
          workspace_reporting_currency_code: 'USD',
          workspace_currency_display_preference: 'symbol',
          effective_reporting_currency_code: 'USD',
          effective_currency_display_preference: 'symbol',
          updated_at: '2026-05-24T00:00:00Z',
        }),
      ),
      http.get('*/v1/investing/summary', () =>
        HttpResponse.json({
          portfolio_value: '0',
          holdings_count: 0,
          cash_total: '0',
          currency_breakdown: {},
          daily_change: null,
          reporting_currency: 'USD',
          valuation_status: 'single_currency_native',
        }),
      ),
      http.get('*/v1/investing/performance/summary', () =>
        HttpResponse.json({
          total_value: '0',
          total_cost: '0',
          total_gain_loss: '0',
          total_gain_loss_pct: '0',
          snapshot_date: '2026-05-24',
          currency: 'USD',
        }),
      ),
      http.get('*/v1/investing/instruments', () => HttpResponse.json([])),
      http.post('*/v1/finance/accounts', async ({ request }) => {
        const body = (await request.json()) as {
          name: string;
          account_type: 'bank' | 'brokerage' | 'wallet' | 'card' | 'gift_card';
          default_currency_code: string;
        };
        accountList = {
          ...accountList,
          items: [
            {
              public_id: '22222222-2222-2222-2222-222222222222',
              name: body.name,
              account_type: body.account_type,
              default_currency_code: body.default_currency_code,
              is_active: true,
              created_at: '2026-05-24T00:00:00Z',
              updated_at: '2026-05-24T00:00:00Z',
            },
          ],
          total: 1,
        };
        return HttpResponse.json(accountList.items[0], { status: 201 });
      }),
      http.post('*/v1/investing/holdings', async ({ request }) => {
        holdingPayload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            public_id: '33333333-3333-3333-3333-333333333333',
            symbol: holdingPayload.symbol,
            account_name: holdingPayload.account_name,
            quantity: holdingPayload.quantity,
            avg_cost: holdingPayload.avg_cost,
            currency: holdingPayload.currency,
            created_at: '2026-05-24T00:00:00Z',
            updated_at: '2026-05-24T00:00:00Z',
          },
          { status: 201 },
        );
      }),
    );

    renderWithQuery(<InvestingPage />);

    await screen.findByText('Investing');
    
    // Open the Add Holding Modal
    fireEvent.click(await screen.findByRole('button', { name: /Add Holding/i }));

    fireEvent.change(await screen.findByPlaceholderText('Account name'), {
      target: { value: 'Primary Brokerage' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Primary Brokerage')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Symbol (e.g. AAPL)'), {
      target: { value: 'AAPL' },
    });
    fireEvent.change(screen.getByPlaceholderText('Quantity'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByPlaceholderText('Avg cost'), {
      target: { value: '150.25' },
    });
    fireEvent.click(screen.getByTestId('investing-holding-submit'));

    await waitFor(() => {
      expect(holdingPayload).not.toBeNull();
    });
    expect(holdingPayload).toMatchObject({
      symbol: 'AAPL',
      account_id: '22222222-2222-2222-2222-222222222222',
      quantity: 10,
      avg_cost: 150.25,
      currency: 'USD',
      instrument_type: 'stock',
    });
  });

  it('loads look-through analytics tab with exposure and overlap data', async () => {
    server.use(
      http.get('*/v1/investing/holdings', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/investing/cash-balances', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/finance/accounts', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/finance/currencies', () =>
        HttpResponse.json([
          { code: 'USD', name: 'US Dollar', symbol: '$', minor_unit: 2, is_active: true },
        ]),
      ),
      http.get('*/v1/finance/settings/user', () =>
        HttpResponse.json({
          reporting_currency_override_code: null,
          currency_display_preference_override: null,
          workspace_reporting_currency_code: 'USD',
          workspace_currency_display_preference: 'symbol',
          effective_reporting_currency_code: 'USD',
          effective_currency_display_preference: 'symbol',
          updated_at: '2026-05-24T00:00:00Z',
        }),
      ),
      http.get('*/v1/investing/summary', () =>
        HttpResponse.json({
          portfolio_value: '0',
          holdings_count: 0,
          cash_total: '0',
          currency_breakdown: {},
          daily_change: null,
          reporting_currency: 'USD',
          valuation_status: 'single_currency_native',
        }),
      ),
      http.get('*/v1/investing/performance/summary', () =>
        HttpResponse.json({
          total_gain_loss: '0.00',
          total_gain_loss_pct: '0.00',
          holdings_count: 0,
        }),
      ),
      http.get('*/v1/investing/instruments', () =>
        HttpResponse.json([
          {
            public_id: '44444444-4444-4444-4444-444444444444',
            symbol: 'VTI',
            name: 'Vanguard Total Market ETF',
            instrument_type: 'etf',
            company_id: null,
            is_active: true,
            created_at: '2026-05-24T00:00:00Z',
            updated_at: '2026-05-24T00:00:00Z',
          },
        ]),
      ),
      http.get('*/v1/investing/analytics/exposure', () =>
        HttpResponse.json({
          as_of_date: '2026-05-24',
          analysis_status: 'complete',
          snapshot_coverage: '1',
          staleness_days: 30,
          warnings: [],
          exposure: [
            {
              company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
              company_name: 'Apple Inc',
              company_ticker: 'AAPL',
              direct_exposure: '300.00',
              lookthrough_exposure: '900.00',
            },
          ],
          total_direct_exposure: '300.00',
          total_lookthrough_exposure: '1000.00',
        }),
      ),
      http.get('*/v1/investing/analytics/overlap', () =>
        HttpResponse.json({
          as_of_date: '2026-05-24',
          analysis_status: 'complete',
          snapshot_coverage: '1',
          warnings: [],
          top_5_concentration_pct: '0.90',
          top_10_concentration_pct: '1.00',
          duplicate_exposure_index: '0.70',
          overlaps: [
            {
              company_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
              company_name: 'Apple Inc',
              company_ticker: 'AAPL',
              overlap_exposure: '900.00',
              portfolio_share: '0.90',
            },
          ],
        }),
      ),
    );

    renderWithQuery(<InvestingPage />);

    await screen.findByText('Investing');
    const analyticsTab = await screen.findByRole('tab', { name: 'Look-through Analytics' });
    analyticsTab.focus();
    fireEvent.keyDown(analyticsTab, { key: 'Enter', code: 'Enter' });

    expect(await screen.findByText('Exposure (Look-through)')).toBeInTheDocument();
    expect(await screen.findByText('Overlap')).toBeInTheDocument();
    const aaplRows = await screen.findAllByText('AAPL');
    expect(aaplRows.length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText(/Top 5 concentration/)).toBeInTheDocument();
  });

  it('renders unit price, current value, gain/loss, and handles refresh and manual edit price actions', async () => {
    let refreshCalled = false;
    let submitPayload: {
      price_date: string;
      prices: Array<{ holding_public_id: string; unit_price: number }>;
    } | null = null;

    server.use(
      http.get('*/v1/investing/holdings', () =>
        HttpResponse.json({
          items: [
            {
              public_id: 'holding-aapl-id',
              symbol: 'AAPL',
              account_id: '11111111-1111-1111-1111-111111111111',
              account_name: 'Brokerage A',
              quantity: '10.00000000',
              avg_cost: '150.00',
              currency: 'USD',
              current_price: '180.00',
              current_value: '1800.00',
              gain_loss: '300.00',
              gain_loss_pct: '20.00',
              created_at: '2026-05-24T00:00:00Z',
              updated_at: '2026-05-24T00:00:00Z',
            },
          ],
          total: 1,
          limit: 200,
          offset: 0,
        }),
      ),
      http.get('*/v1/investing/cash-balances', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/finance/accounts', () =>
        HttpResponse.json({
          items: [
            {
              public_id: '11111111-1111-1111-1111-111111111111',
              name: 'Brokerage A',
              account_type: 'brokerage',
              default_currency_code: 'USD',
              is_active: true,
              created_at: '2026-05-24T00:00:00Z',
              updated_at: '2026-05-24T00:00:00Z',
            },
          ],
          total: 1,
          limit: 200,
          offset: 0,
        }),
      ),
      http.get('*/v1/finance/currencies', () =>
        HttpResponse.json([
          { code: 'USD', name: 'US Dollar', symbol: '$', minor_unit: 2, is_active: true },
        ]),
      ),
      http.get('*/v1/finance/settings/user', () =>
        HttpResponse.json({
          reporting_currency_override_code: null,
          currency_display_preference_override: null,
          workspace_reporting_currency_code: 'USD',
          workspace_currency_display_preference: 'symbol',
          effective_reporting_currency_code: 'USD',
          effective_currency_display_preference: 'symbol',
          updated_at: '2026-05-24T00:00:00Z',
        }),
      ),
      http.get('*/v1/investing/summary', () =>
        HttpResponse.json({
          portfolio_value: '1800.00',
          holdings_count: 1,
          cash_total: '0',
          currency_breakdown: { USD: '1500.00' },
          daily_change: null,
          reporting_currency: 'USD',
          valuation_status: 'single_currency_native',
        }),
      ),
      http.get('*/v1/investing/instruments', () => HttpResponse.json([])),
      http.get('*/v1/investing/performance/summary', () =>
        HttpResponse.json({
          total_value: '1800.00',
          total_cost: '1500.00',
          total_gain_loss: '300.00',
          total_gain_loss_pct: '20.00',
          snapshot_date: '2026-05-24',
          currency: 'USD',
        }),
      ),
      http.post('*/v1/investing/prices/refresh', () => {
        refreshCalled = true;
        return HttpResponse.json({ updated: ['AAPL'] });
      }),
      http.post('*/v1/investing/prices', async ({ request }) => {
        submitPayload = (await request.json()) as {
          price_date: string;
          prices: Array<{ holding_public_id: string; unit_price: number }>;
        };
        return HttpResponse.json({ ok: true });
      }),
    );

    renderWithQuery(<InvestingPage />);

    // Wait for holding row to render
    const holdingRow = await screen.findByTestId('investing-holding-row-holding-aapl-id');
    expect(holdingRow).toBeInTheDocument();

    // Verify headers and row values
    expect(screen.getByText('Unit Price')).toBeInTheDocument();
    expect(screen.getByText('Current Value')).toBeInTheDocument();
    expect(screen.getByText('Gain / Loss')).toBeInTheDocument();

    expect(screen.getByText('$180.00')).toBeInTheDocument();
    expect(screen.getAllByText('$1,800.00').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('+$300.00 (+20.00%)')).toBeInTheDocument();

    // Test Refresh button
    const refreshBtn = screen.getByTestId('investing-refresh-prices-btn');
    fireEvent.click(refreshBtn);
    await waitFor(() => {
      expect(refreshCalled).toBe(true);
    });

    // Test Inline Price Edit
    const editBtn = screen.getByTestId('investing-edit-price-holding-aapl-id');
    fireEvent.click(editBtn);

    const priceInput = screen.getByTestId('investing-price-input-holding-aapl-id');
    expect(priceInput).toHaveValue(180);

    fireEvent.change(priceInput, { target: { value: '190.50' } });
    const saveBtn = screen.getByTestId('investing-save-price-holding-aapl-id');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(submitPayload).not.toBeNull();
    });
    expect(submitPayload!.prices[0]).toEqual({
      holding_public_id: 'holding-aapl-id',
      unit_price: 190.5,
    });
  });

  it('edits holding economics and linked asset type from the holdings table', async () => {
    let holdingPatchPayload: Record<string, unknown> | null = null;
    let instrumentPatchPayload: Record<string, unknown> | null = null;

    server.use(
      http.get('*/v1/investing/holdings', () =>
        HttpResponse.json({
          items: [
            {
              public_id: 'holding-vti-id',
              symbol: 'VTI',
              instrument_type: 'stock',
              account_id: '11111111-1111-1111-1111-111111111111',
              account_name: 'Brokerage A',
              quantity: '10.00000000',
              avg_cost: '150.00',
              currency: 'USD',
              current_price: '180.00',
              current_value: '1800.00',
              gain_loss: '300.00',
              gain_loss_pct: '20.00',
              created_at: '2026-05-24T00:00:00Z',
              updated_at: '2026-05-24T00:00:00Z',
            },
          ],
          total: 1,
          limit: 200,
          offset: 0,
        }),
      ),
      http.get('*/v1/investing/cash-balances', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/finance/accounts', () =>
        HttpResponse.json({
          items: [
            {
              public_id: '11111111-1111-1111-1111-111111111111',
              name: 'Brokerage A',
              account_type: 'brokerage',
              default_currency_code: 'USD',
              is_active: true,
              created_at: '2026-05-24T00:00:00Z',
              updated_at: '2026-05-24T00:00:00Z',
            },
          ],
          total: 1,
          limit: 200,
          offset: 0,
        }),
      ),
      http.get('*/v1/finance/currencies', () =>
        HttpResponse.json([
          { code: 'USD', name: 'US Dollar', symbol: '$', minor_unit: 2, is_active: true },
          { code: 'INR', name: 'Indian Rupee', symbol: 'Rs', minor_unit: 2, is_active: true },
        ]),
      ),
      http.get('*/v1/finance/settings/user', () =>
        HttpResponse.json({
          reporting_currency_override_code: null,
          currency_display_preference_override: null,
          workspace_reporting_currency_code: 'USD',
          workspace_currency_display_preference: 'symbol',
          effective_reporting_currency_code: 'USD',
          effective_currency_display_preference: 'symbol',
          updated_at: '2026-05-24T00:00:00Z',
        }),
      ),
      http.get('*/v1/investing/summary', () =>
        HttpResponse.json({
          portfolio_value: '1800.00',
          holdings_count: 1,
          cash_total: '0',
          currency_breakdown: { USD: '1500.00' },
          daily_change: null,
          reporting_currency: 'USD',
          valuation_status: 'single_currency_native',
        }),
      ),
      http.get('*/v1/investing/performance/summary', () =>
        HttpResponse.json({
          total_value: '1800.00',
          total_cost: '1500.00',
          total_gain_loss: '300.00',
          total_gain_loss_pct: '20.00',
          snapshot_date: '2026-05-24',
          currency: 'USD',
        }),
      ),
      http.get('*/v1/investing/instruments', () =>
        HttpResponse.json([
          {
            public_id: 'instrument-vti-id',
            symbol: 'VTI',
            name: 'Vanguard Total Market ETF',
            instrument_type: 'stock',
            company_id: 'company-vti-id',
            is_active: true,
            created_at: '2026-05-24T00:00:00Z',
            updated_at: '2026-05-24T00:00:00Z',
          },
        ]),
      ),
      http.patch('*/v1/investing/holdings/holding-vti-id', async ({ request }) => {
        holdingPatchPayload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          public_id: 'holding-vti-id',
          symbol: 'VTI',
          instrument_type: 'stock',
          account_id: '11111111-1111-1111-1111-111111111111',
          account_name: 'Brokerage A',
          quantity: holdingPatchPayload.quantity,
          avg_cost: holdingPatchPayload.avg_cost,
          currency: holdingPatchPayload.currency,
          created_at: '2026-05-24T00:00:00Z',
          updated_at: '2026-05-24T00:00:00Z',
        });
      }),
      http.patch('*/v1/investing/instruments/instrument-vti-id', async ({ request }) => {
        instrumentPatchPayload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          public_id: 'instrument-vti-id',
          symbol: 'VTI',
          name: instrumentPatchPayload.name,
          instrument_type: instrumentPatchPayload.instrument_type,
          company_id: null,
          is_active: true,
          created_at: '2026-05-24T00:00:00Z',
          updated_at: '2026-05-24T00:00:00Z',
        });
      }),
    );

    renderWithQuery(<InvestingPage />);

    await screen.findByTestId('investing-holding-row-holding-vti-id');
    fireEvent.click(screen.getByTestId('investing-edit-holding-holding-vti-id'));

    fireEvent.change(await screen.findByTestId('investing-edit-holding-quantity'), {
      target: { value: '12.5' },
    });
    fireEvent.change(screen.getByTestId('investing-edit-holding-avg-cost'), {
      target: { value: '155.75' },
    });

    fireEvent.click(screen.getByTestId('investing-edit-holding-instrument-type'));
    fireEvent.click(await screen.findByRole('option', { name: 'ETF' }));

    fireEvent.click(screen.getByTestId('investing-edit-holding-submit'));

    await waitFor(() => {
      expect(holdingPatchPayload).not.toBeNull();
      expect(instrumentPatchPayload).not.toBeNull();
    });
    expect(holdingPatchPayload).toEqual({
      quantity: 12.5,
      avg_cost: 155.75,
      currency: 'USD',
    });
    expect(instrumentPatchPayload).toEqual({
      name: 'Vanguard Total Market ETF',
      instrument_type: 'etf',
    });
  });

  it('calculates converted table totals and shows portfolio value with date under multi-currency converted summary', async () => {
    server.use(
      http.get('*/v1/investing/holdings', () =>
        HttpResponse.json({
          items: [
            {
              public_id: 'holding-usd',
              symbol: 'AAPL',
              account_id: '11111111-1111-1111-1111-111111111111',
              account_name: 'Brokerage A',
              quantity: '10.00000000',
              avg_cost: '150.00',
              currency: 'USD',
              current_price: '180.00',
              current_value: '1800.00',
              gain_loss: '300.00',
              gain_loss_pct: '20.00',
              created_at: '2026-05-24T00:00:00Z',
              updated_at: '2026-05-24T00:00:00Z',
            },
            {
              public_id: 'holding-cad',
              symbol: 'SHOP',
              account_id: '11111111-1111-1111-1111-111111111111',
              account_name: 'Brokerage A',
              quantity: '20.00000000',
              avg_cost: '80.00',
              currency: 'CAD',
              current_price: '90.00',
              current_value: '1800.00',
              gain_loss: '200.00',
              gain_loss_pct: '12.50',
              created_at: '2026-05-24T00:00:00Z',
              updated_at: '2026-05-24T00:00:00Z',
            },
          ],
          total: 2,
          limit: 200,
          offset: 0,
        }),
      ),
      http.get('*/v1/investing/cash-balances', () =>
        HttpResponse.json({ items: [], total: 0, limit: 200, offset: 0 }),
      ),
      http.get('*/v1/finance/accounts', () =>
        HttpResponse.json({
          items: [
            {
              public_id: '11111111-1111-1111-1111-111111111111',
              name: 'Brokerage A',
              account_type: 'brokerage',
              default_currency_code: 'USD',
              is_active: true,
              created_at: '2026-05-24T00:00:00Z',
              updated_at: '2026-05-24T00:00:00Z',
            },
          ],
          total: 1,
          limit: 200,
          offset: 0,
        }),
      ),
      http.get('*/v1/finance/currencies', () =>
        HttpResponse.json([
          { code: 'USD', name: 'US Dollar', symbol: '$', minor_unit: 2, is_active: true },
          { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', minor_unit: 2, is_active: true },
        ]),
      ),
      http.get('*/v1/finance/settings/user', () =>
        HttpResponse.json({
          reporting_currency_override_code: null,
          currency_display_preference_override: null,
          workspace_reporting_currency_code: 'USD',
          workspace_currency_display_preference: 'symbol',
          effective_reporting_currency_code: 'USD',
          effective_currency_display_preference: 'symbol',
          updated_at: '2026-05-24T00:00:00Z',
        }),
      ),
      http.get('*/v1/investing/summary', () =>
        HttpResponse.json({
          portfolio_value: '2668.00',
          holdings_count: 2,
          cash_total: '0.00',
          currency_breakdown: { USD: '1500.00', CAD: '1600.00' },
          daily_change: null,
          reporting_currency: 'USD',
          valuation_status: 'converted_available',
          fx_rates_used: { CAD: '0.73' },
        }),
      ),
      http.get('*/v1/investing/performance/summary', () =>
        HttpResponse.json({
          total_value: '3114.00',
          total_cost: '2668.00',
          total_gain_loss: '446.00',
          total_gain_loss_pct: '16.72',
          snapshot_date: '2026-06-13',
          currency: 'USD',
          fx_rates_used: { CAD: '0.73' },
        }),
      ),
      http.get('*/v1/investing/instruments', () => HttpResponse.json([])),
    );

    renderWithQuery(<InvestingPage />);

    // Wait for the rows to render
    expect(await screen.findByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('SHOP')).toBeInTheDocument();

    // Verify converted table footer totals:
    // Book Cost: 10 * 150 (USD) + 20 * 80 * 0.73 (CAD -> USD) = 1500 + 1168 = 2668.00 USD
    // Current Value: 10 * 180 (USD) + 20 * 90 * 0.73 (CAD -> USD) = 1800 + 1314 = 3114.00 USD
    expect(screen.getByText('$2,668.00')).toBeInTheDocument();
    expect(screen.getAllByText('$3,114.00').length).toBe(2);

    // Verify Portfolio value card uses performance summary current market value and contains the snapshot date
    const portfolioCardHeader = screen.getByText(/Portfolio value \(as of 2026-06-13\)/i);
    expect(portfolioCardHeader).toBeInTheDocument();

    const portfolioCardValue = screen.getByTestId('investing-portfolio-value');
    expect(portfolioCardValue).toHaveTextContent('$3,114.00');
  });
});

