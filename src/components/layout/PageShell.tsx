import React from 'react';

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
};

export const PageShell: React.FC<PageShellProps> = ({ children, className, animated = false }) => {
  const baseClassName = 'mx-auto w-full max-w-[1400px] px-6 py-8 sm:px-8';
  const animationClassName = animated ? ' animate-in fade-in duration-500' : '';
  const customClassName = className ? ` ${className}` : '';
  return <div className={`${baseClassName}${animationClassName}${customClassName}`}>{children}</div>;
};
