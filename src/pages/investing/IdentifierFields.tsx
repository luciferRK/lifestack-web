import React, { useState } from 'react';
import { investingService } from '../../services/investing';
import type { IdentifierStatus, InstrumentType } from '../../types/investing';
import { useIdentifierHint } from './useIdentifierHint';

export interface IdentifierFieldsValue {
  ticker: string;
  isin: string;
  exchange: string;
}

interface IdentifierFieldsProps {
  value: IdentifierFieldsValue;
  onChange: (value: IdentifierFieldsValue) => void;
  instrumentType: InstrumentType;
  idPrefix: string;
}

const STATUS_COPY: Record<IdentifierStatus, string> = {
  resolved: '✓ resolved',
  unresolved: '⚠ unresolved — will still save',
  ambiguous: '⚠ ambiguous — confirm',
};

// Shared by Holdings Edit Holding modal, Analytics Edit Instrument modal, and
// Create Instrument (spec-010 §3.1/§3.2/§3.5) so the per-type hint copy and the
// resolve-on-blur UX exist exactly once. This is advisory only — the API
// schema + resolver stay the authoritative gate (spec-010 §5).
export const IdentifierFields: React.FC<IdentifierFieldsProps> = ({
  value,
  onChange,
  instrumentType,
  idPrefix,
}) => {
  const hint = useIdentifierHint(instrumentType, value.ticker);
  const [resolving, setResolving] = useState(false);
  const [resolveResult, setResolveResult] = useState<{
    status: IdentifierStatus;
    detail: string;
  } | null>(null);

  const handleResolveBlur = async () => {
    const ticker = value.ticker.trim();
    const isin = value.isin.trim();
    const exchange = value.exchange.trim();
    if (!ticker && !isin) {
      setResolveResult(null);
      return;
    }
    setResolving(true);
    try {
      const result = await investingService.resolveReference({
        ticker: ticker || undefined,
        isin: isin || undefined,
        exchange: exchange || undefined,
        type: instrumentType,
      });
      setResolveResult({
        status: result.identifier_status,
        detail: [result.exchange, result.name].filter(Boolean).join(' · '),
      });
    } catch {
      // Advisory only — a resolve failure (endpoint unavailable, network
      // error) must never block the form; just show nothing.
      setResolveResult(null);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400" data-testid={`${idPrefix}-hint`}>
        {hint.helperText}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300">
            Ticker{hint.requiredField !== 'isin' ? ' *' : ''}
          </label>
          <input
            data-testid={`${idPrefix}-ticker`}
            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder={hint.requiredField === 'isin' ? '' : hint.placeholderExample}
            value={value.ticker}
            onChange={(e) => onChange({ ...value, ticker: e.target.value.toUpperCase() })}
            onBlur={handleResolveBlur}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300">
            ISIN{hint.requiredField === 'isin' ? ' *' : ''}
          </label>
          <input
            data-testid={`${idPrefix}-isin`}
            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder={hint.requiredField === 'isin' ? hint.placeholderExample : 'INF209K01165'}
            value={value.isin}
            onChange={(e) => onChange({ ...value, isin: e.target.value.toUpperCase() })}
            onBlur={handleResolveBlur}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300">
            Exchange{hint.requiredField === 'ticker+exchange' ? ' *' : ''}
          </label>
          <input
            data-testid={`${idPrefix}-exchange`}
            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder={hint.requiredField === 'ticker+exchange' ? 'XNSE' : 'optional'}
            value={value.exchange}
            onChange={(e) => onChange({ ...value, exchange: e.target.value.toUpperCase() })}
            onBlur={handleResolveBlur}
          />
        </div>
      </div>
      {resolving ? (
        <p className="text-xs text-slate-500" data-testid={`${idPrefix}-resolve-status`}>
          Checking…
        </p>
      ) : resolveResult ? (
        <p
          className={`text-xs ${
            resolveResult.status === 'resolved'
              ? 'text-emerald-300'
              : resolveResult.status === 'ambiguous'
                ? 'text-amber-300'
                : 'text-amber-300'
          }`}
          data-testid={`${idPrefix}-resolve-status`}
        >
          {STATUS_COPY[resolveResult.status]}
          {resolveResult.detail ? ` (${resolveResult.detail})` : ''}
        </p>
      ) : null}
    </div>
  );
};
