import { describe, expect, it } from 'vitest';
import { useIdentifierHint } from './useIdentifierHint';

describe('useIdentifierHint', () => {
  it('requires ticker for a US stock (no suffix)', () => {
    expect(useIdentifierHint('stock', 'AAPL').requiredField).toBe('ticker');
  });

  it('requires ticker+exchange for an Indian stock (.NS/.BO suffix)', () => {
    expect(useIdentifierHint('stock', 'RELIANCE.NS').requiredField).toBe('ticker+exchange');
    expect(useIdentifierHint('stock', 'RELIANCE.BO').requiredField).toBe('ticker+exchange');
  });

  it('requires isin for a mutual fund regardless of ticker', () => {
    expect(useIdentifierHint('mutual_fund', '').requiredField).toBe('isin');
    expect(useIdentifierHint('mutual_fund', 'ignored').requiredField).toBe('isin');
  });

  it('accepts an exchange-suffixed ticker or ISIN for a UK/other ETF', () => {
    const hint = useIdentifierHint('etf', 'HIEU.L');
    expect(hint.requiredField).toBe('ticker');
    expect(hint.placeholderExample).toBe('HIEU.L');
  });

  it('defaults to US ticker for an ETF with no suffix', () => {
    const hint = useIdentifierHint('etf', 'VTI');
    expect(hint.requiredField).toBe('ticker');
    expect(hint.placeholderExample).toBe('VTI');
  });
});
