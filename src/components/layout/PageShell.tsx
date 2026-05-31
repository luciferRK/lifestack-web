import React from 'react';

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
};

export const PageShell: React.FC<PageShellProps> = ({ children, className, animated = false }) => {
  const baseClassName = 'mx-auto w-full max-w-[var(--max-content-width)] px-[var(--page-padding-x)] py-8';
  const animationClassName = animated ? ' animate-in fade-in duration-500' : '';
  const customClassName = className ? ` ${className}` : '';
  return <div className={`${baseClassName}${animationClassName}${customClassName}`}>{children}</div>;
};
