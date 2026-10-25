import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-yellow-400 text-yellow-950 hover:bg-yellow-300 active:bg-yellow-500 font-bold shadow-[0_10px_24px_-12px_rgba(202,138,4,0.8)] border border-yellow-500/80',
      secondary: 'bg-white/90 text-sky-950 hover:bg-sky-50 border border-sky-200 font-semibold shadow-sm',
      outline: 'border border-sky-300 bg-white/30 hover:bg-sky-100 text-sky-950',
      ghost: 'bg-transparent hover:bg-sky-100/70 text-sky-950',
      danger: 'bg-red-600 text-white hover:bg-red-500 shadow-[0_10px_24px_-12px_rgba(220,38,38,0.8)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
