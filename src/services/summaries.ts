import api from './api';
import type { PaginatedResponse } from '../types/common';

export interface WeeklySummary {
  public_id: string;
  week_start: string;
  week_end: string;
  generated_at: string;
  todo_summary: {
    tasks_created: number;
    tasks_completed: number;
    tasks_overdue?: number;
    completion_rate_pct?: number | string | null;
  };
  spending_summary: {
    status: 'complete' | 'unavailable';
    total_income: string | null;
    total_expense: string | null;
    net: string | null;
    currency: string | null;
    has_multiple_currencies: boolean;
    currency_breakdown?: Record<string, { income: string; expense: string }>;
    top_categories?: Array<{ name: string; amount: string; pct_of_total: string }>;
    budget_utilization_pct?: string | null;
    budgets_breached?: number;
    recurring_generated_count?: number;
  };
  investing_summary: {
    status: 'complete' | 'unavailable';
    portfolio_value_start: string | null;
    portfolio_value_end: string | null;
    cash_start: string | null;
    cash_end: string | null;
    week_change: string | null;
    week_change_pct: string | null;
    currency: string | null;
    start_snapshot_date: string | null;
    end_snapshot_date: string | null;
  };
  highlights: {
    flags: Array<{ type: string; message: string }>;
  };
}

export const summariesService = {
  listWeekly: async (limit = 20, offset = 0): Promise<PaginatedResponse<WeeklySummary>> => {
    const res = await api.get('/summaries/weekly', { params: { limit, offset } });
    return res.data;
  },
  latestWeekly: async (): Promise<WeeklySummary> => {
    const res = await api.get('/summaries/weekly/latest');
    return res.data;
  },
};
