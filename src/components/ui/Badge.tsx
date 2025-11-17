import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'low' | 'medium' | 'high' | 'default';
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium';
  
  const variantStyles = {
    default: 'bg-[var(--mv-bg-soft)] text-[var(--mv-primary)]',
    low: 'bg-emerald-50/80 text-emerald-700',
    medium: 'bg-amber-50/80 text-amber-700',
    high: 'bg-rose-50/80 text-rose-700',
  };

  return (
    <span
      className={`${baseClasses} min-h-[34px] ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

