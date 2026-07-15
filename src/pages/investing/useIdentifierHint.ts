import type { InstrumentType } from '../../types/investing';

// Per-(instrument_type, market) required-identifier rule (api spec-083 §6).
// Market is inferred here only for hint copy — a bare suffix heuristic, never
// authoritative (api spec-083 §6.1 / spec-010 §5: the resolve endpoint and the
// API schema/resolver are the real gate).
export type IdentifierRequiredField = 'ticker' | 'isin' | 'ticker+exchange';

export interface IdentifierHint {
  requiredField: IdentifierRequiredField;
  helperText: string;
  placeholderExample: string;
}

const INDIA_SUFFIXES = ['.NS', '.BO'];

export function useIdentifierHint(
  instrumentType: InstrumentType,
  tickerValue?: string,
): IdentifierHint {
  const ticker = (tickerValue || '').trim().toUpperCase();

  if (instrumentType === 'mutual_fund') {
    return {
      requiredField: 'isin',
      helperText: 'Mutual funds have no ticker — enter the ISIN or AMFI scheme code.',
      placeholderExample: 'INF209K01165',
    };
  }

  const isIndiaSuffix = INDIA_SUFFIXES.some((suffix) => ticker.endsWith(suffix));

  if (instrumentType === 'stock') {
    if (isIndiaSuffix) {
      return {
        requiredField: 'ticker+exchange',
        helperText: 'Indian stocks need the exchange symbol plus its exchange (NSE/BSE).',
        placeholderExample: 'RELIANCE, XNSE',
      };
    }
    return {
      requiredField: 'ticker',
      helperText: 'US stocks: enter the exchange ticker.',
      placeholderExample: 'AAPL',
    };
  }

  // etf
  const hasNonIndiaSuffix = ticker.includes('.') && !isIndiaSuffix;
  if (hasNonIndiaSuffix) {
    return {
      requiredField: 'ticker',
      helperText: 'Non-US ETFs: use the exchange-suffixed ticker (e.g. HIEU.L) or ISIN.',
      placeholderExample: 'HIEU.L',
    };
  }
  return {
    requiredField: 'ticker',
    helperText: 'US ETFs: enter the exchange ticker.',
    placeholderExample: 'VTI',
  };
}
