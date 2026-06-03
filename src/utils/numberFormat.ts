export const toNumber = (value: number | string | null | undefined): number => {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const formatCurrency = (
  amount: number | string | null | undefined,
  currency: string | null | undefined = 'USD',
  currencyDisplay: 'symbol' | 'code' = 'symbol',
): string => {
  const normalizedCurrency = (currency || 'USD').trim().toUpperCase();
  const numericAmount = toNumber(amount);

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: normalizedCurrency,
      currencyDisplay,
      minimumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${normalizedCurrency} ${numericAmount.toFixed(2)}`;
  }
};
