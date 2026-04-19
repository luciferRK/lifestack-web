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

export const spendingService = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/spending/categories');
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
  getTransactions: async (): Promise<Transaction[]> => {
    // If month filtering is needed later, we can pass it as a param. Right now the API gets all.
    const response = await api.get('/spending/transactions');
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
  getBudgets: async (): Promise<Budget[]> => {
    const response = await api.get('/spending/budgets');
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
