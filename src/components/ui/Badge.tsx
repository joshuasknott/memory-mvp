import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'low' | 'medium' | 'high' | 'default';
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800',
    low: 'bg-green-50 text-green-700 border border-green-200',
    medium: 'bg-amber-50 text-amber-700 border border-amber-200',
    high: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

