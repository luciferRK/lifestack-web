import React from 'react';

// ---------------------------------------------------------------------------
// Skeleton primitives for route-level loading states
// ---------------------------------------------------------------------------

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-slate-800 ${className}`} />
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-800/70 p-5 ${className}`}>
    <SkeletonLine className="h-3 w-24 mb-3" />
    <SkeletonLine className="h-7 w-32 mb-2" />
    <SkeletonLine className="h-3 w-40" />
  </div>
);

export const SkeletonList: React.FC<{ rows?: number; className?: string }> = ({
  rows = 5,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-3 w-20" />
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="h-3 w-1/2" />
          </div>
          <SkeletonLine className="h-6 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonStatGrid: React.FC<{ cols?: number }> = ({ cols = 4 }) => (
  <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-${cols}`}>
    {[...Array(cols)].map((_, i) => (
      <SkeletonCard key={i} className="h-32" />
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Empty state — call-to-action style
// ---------------------------------------------------------------------------

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-16 text-center">
    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-slate-400">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
    <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// ---------------------------------------------------------------------------
// Error state — dismissable banner
// ---------------------------------------------------------------------------

type ErrorBannerProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => (
  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-4 w-4 shrink-0 text-rose-400">
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 5Zm0 6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-rose-200">{title}</p>
        <p className="mt-0.5 text-sm text-rose-200/70">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);
