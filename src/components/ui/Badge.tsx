import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'low' | 'medium' | 'high' | 'default';
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-[var(--mv-bg-soft)] text-[var(--mv-primary)]',
    low: 'bg-[#e8f4ef] text-[#2f5d47]',
    medium: 'bg-[#f5ebd7] text-[#5b431d]',
    high: 'bg-[#f8e2e7] text-[#6c2835]',
  };

  return (
    <span
      className={`inline-flex min-h-[34px] items-center rounded-full px-4 py-1 text-[0.95rem] font-semibold tracking-tight ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

