import {
  ButtonHTMLAttributes,
  ReactElement,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'subtle' | 'danger';
  asChild?: boolean;
}

const mergeClasses = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ').trim();

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      asChild = false,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mv-bg)] disabled:cursor-not-allowed disabled:opacity-60 min-h-[44px] no-underline border border-transparent';

    const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-[linear-gradient(135deg,var(--mv-gradient-start),var(--mv-gradient-mid),var(--mv-gradient-end))] text-[var(--mv-text-on-dark)] shadow-[var(--mv-shadow-soft)] hover:brightness-[1.05] hover:shadow-[0_18px_34px_rgba(76,111,232,0.32)] active:translate-y-[1px]',
      secondary:
        'bg-[var(--mv-surface-soft)] text-[var(--mv-primary)] border-[var(--mv-border-soft)] shadow-none hover:border-[var(--mv-border-strong)] hover:bg-[var(--mv-secondary)] hover:-translate-y-[1px]',
      subtle:
        'bg-transparent text-[var(--mv-primary)] font-medium underline-offset-4 shadow-none hover:underline focus-visible:ring-offset-[var(--mv-bg)]',
      danger:
        'bg-[var(--mv-danger)] text-[var(--mv-text-on-dark)] shadow-[0_10px_22px_rgba(183,91,91,0.2)] hover:bg-[#a24e4e] active:translate-y-[1px]',
    };

    const composedClassName = mergeClasses(
      baseStyles,
      variantStyles[variant],
      className
    );

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        className: mergeClasses(composedClassName, child.props.className),
        ...(props as Record<string, unknown>),
      });
    }

    return (
      <button ref={ref} type={type} className={composedClassName} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

