import api from './api';

export interface DashboardTodoItem {
  public_id?: string;
  title?: string;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high';
}

export interface DashboardOverspentCategory {
  category_id?: string;
  name?: string;
  budget?: number | null;
  amount?: number;
  overage?: number;
}

export interface DashboardSummary {
  todos: {
    status: string;
    open_count: number;
    overdue_count: number;
    next_due_items: DashboardTodoItem[];
    active_guardrail_todo_count: number;
  };
  spending: {
    status: string;
    month_spent: number | string;
    month_budget: number | string | null;
    top_overspent_categories: DashboardOverspentCategory[];
  };
  investing: {
    status: string;
    portfolio_value: number | string | null;
    invested_value: number | string | null;
    total_gain_loss: number | string | null;
    total_gain_loss_pct: number | string | null;
    daily_change: number | string | null;
    daily_change_pct: number | string | null;
    snapshot_date: string | null;
    previous_snapshot_date: string | null;
    valuation_status: string;
    holdings_count: number;
    cash_total: number | string | null;
  };
  system: {
    generated_at: string;
  };
}

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },
};
