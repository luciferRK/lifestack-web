import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

const Badge: React.FC<BadgeProps> = ({ children, className, title }) => {
  const extraClass = className ? ` ${className}` : '';
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs${extraClass}`}
    >
      {children}
    </span>
  );
};

export const CurrencyBadge: React.FC<{ code: string; title?: string }> = ({ code, title }) => (
  <Badge
    title={title}
    className="border-cyan-500/40 bg-cyan-500/10 font-medium text-cyan-300"
  >
    {code}
  </Badge>
);

export const AccountTypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <Badge className="border-slate-600 text-slate-300">
    {type.replace('_', ' ')}
  </Badge>
);

export const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <Badge
    className={
      active
        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
        : 'border-slate-600 bg-slate-800/60 text-slate-300'
    }
  >
    {active ? 'Active' : 'Inactive'}
  </Badge>
);
