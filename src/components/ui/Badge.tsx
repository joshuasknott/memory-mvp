import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'low' | 'medium' | 'high' | 'default';
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
    low: 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
    medium: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
    high: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

