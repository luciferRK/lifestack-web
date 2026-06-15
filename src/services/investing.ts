import api from './api';
import type { PaginatedResponse } from '../types/common';
import type {
  CashBalance,
  CashBalanceCreate,
  CashBalanceUpdate,
  ExposureAnalytics,
  Holding,
  HoldingCreate,
  HoldingUpdate,
  Instrument,
  InstrumentConstituent,
  InstrumentConstituentUpsert,
  InstrumentCreate,
  InstrumentUpdate,
  InvestingSummary,
  OverlapAnalytics,
  PerformanceSummary,
} from '../types/investing';

export const investingService = {
  getHoldings: async (limit: number = 50, offset: number = 0): Promise<PaginatedResponse<Holding>> => {
    const response = await api.get('/investing/holdings', { params: { limit, offset } });
    return response.data;
  },

  createHolding: async (data: HoldingCreate): Promise<Holding> => {
    const response = await api.post('/investing/holdings', data);
    return response.data;
  },

  updateHolding: async (publicId: string, data: HoldingUpdate): Promise<Holding> => {
    const response = await api.patch(`/investing/holdings/${publicId}`, data);
    return response.data;
  },

  deleteHolding: async (publicId: string): Promise<void> => {
    await api.delete(`/investing/holdings/${publicId}`);
  },

  getCashBalances: async (
    limit: number = 50,
    offset: number = 0,
  ): Promise<PaginatedResponse<CashBalance>> => {
    const response = await api.get('/investing/cash-balances', { params: { limit, offset } });
    return response.data;
  },

  createCashBalance: async (data: CashBalanceCreate): Promise<CashBalance> => {
    const response = await api.post('/investing/cash-balances', data);
    return response.data;
  },

  updateCashBalance: async (publicId: string, data: CashBalanceUpdate): Promise<CashBalance> => {
    const response = await api.patch(`/investing/cash-balances/${publicId}`, data);
    return response.data;
  },

  deleteCashBalance: async (publicId: string): Promise<void> => {
    await api.delete(`/investing/cash-balances/${publicId}`);
  },

  getSummary: async (): Promise<InvestingSummary> => {
    const response = await api.get('/investing/summary');
    return response.data;
  },

  getInstruments: async (): Promise<Instrument[]> => {
    const response = await api.get('/investing/instruments');
    return response.data;
  },

  createInstrument: async (data: InstrumentCreate): Promise<Instrument> => {
    const response = await api.post('/investing/instruments', data);
    return response.data;
  },

  updateInstrument: async (publicId: string, data: InstrumentUpdate): Promise<Instrument> => {
    const response = await api.patch(`/investing/instruments/${publicId}`, data);
    return response.data;
  },

  getInstrumentConstituents: async (
    instrumentId: string,
    asOf: string,
  ): Promise<InstrumentConstituent[]> => {
    const response = await api.get(`/investing/instruments/${instrumentId}/constituents`, {
      params: { as_of: asOf },
    });
    return response.data;
  },

  upsertInstrumentConstituents: async (
    instrumentId: string,
    data: InstrumentConstituentUpsert,
  ): Promise<InstrumentConstituent[]> => {
    const response = await api.post(`/investing/instruments/${instrumentId}/constituents`, data);
    return response.data;
  },

  getExposureAnalytics: async (asOf: string): Promise<ExposureAnalytics> => {
    const response = await api.get('/investing/analytics/exposure', { params: { as_of: asOf } });
    return response.data;
  },

  getOverlapAnalytics: async (asOf: string): Promise<OverlapAnalytics> => {
    const response = await api.get('/investing/analytics/overlap', { params: { as_of: asOf } });
    return response.data;
  },

  getPerformanceSummary: async (): Promise<PerformanceSummary> => {
    const response = await api.get('/investing/performance/summary');
    return response.data;
  },

  refreshPrices: async (): Promise<{ updated: string[] }> => {
    const response = await api.post('/investing/prices/refresh');
    return response.data;
  },

  submitPrices: async (data: {
    price_date: string;
    prices: Array<{ holding_public_id: string; unit_price: number | string }>;
  }): Promise<void> => {
    await api.post('/investing/prices', data);
  },
};
