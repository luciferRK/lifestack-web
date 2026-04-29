import api from './api';
import type {
  Category,
  CategoryCreate,
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  Budget,
  BudgetCreate,
  BudgetUpdate,
} from '../types/spending';
import type { PaginatedResponse } from '../types/common';

export const spendingService = {
  // Categories
  getCategories: async (limit: number = 50, offset: number = 0): Promise<PaginatedResponse<Category>> => {
    const response = await api.get('/spending/categories', { params: { limit, offset } });
    return response.data;
  },

  createCategory: async (data: CategoryCreate): Promise<Category> => {
    const response = await api.post('/spending/categories', data);
    return response.data;
  },

  deleteCategory: async (publicId: string): Promise<void> => {
    await api.delete(`/spending/categories/${publicId}`);
  },

  // Transactions
  getTransactions: async (limit: number = 50, offset: number = 0): Promise<PaginatedResponse<Transaction>> => {
    const response = await api.get('/spending/transactions', { params: { limit, offset } });
    return response.data;
  },

  getTransaction: async (publicId: string): Promise<Transaction> => {
    const response = await api.get(`/spending/transactions/${publicId}`);
    return response.data;
  },

  createTransaction: async (data: TransactionCreate): Promise<Transaction> => {
    const response = await api.post('/spending/transactions', data);
    return response.data;
  },

  updateTransaction: async (publicId: string, data: TransactionUpdate): Promise<Transaction> => {
    const response = await api.patch(`/spending/transactions/${publicId}`, data);
    return response.data;
  },

  deleteTransaction: async (publicId: string): Promise<void> => {
    await api.delete(`/spending/transactions/${publicId}`);
  },

  // Budgets
  getBudgets: async (limit: number = 50, offset: number = 0): Promise<PaginatedResponse<Budget>> => {
    const response = await api.get('/spending/budgets', { params: { limit, offset } });
    return response.data;
  },

  createBudget: async (data: BudgetCreate): Promise<Budget> => {
    const response = await api.post('/spending/budgets', data);
    return response.data;
  },

  updateBudget: async (publicId: string, data: BudgetUpdate): Promise<Budget> => {
    const response = await api.patch(`/spending/budgets/${publicId}`, data);
    return response.data;
  },
};
