export const toNumber = (value: number | string | null | undefined): number => {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const formatCurrency = (
  amount: number | string | null | undefined,
  currency: string = 'USD',
  currencyDisplay: 'symbol' | 'code' = 'symbol',
): string =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    currencyDisplay,
    minimumFractionDigits: 2,
  }).format(toNumber(amount));
