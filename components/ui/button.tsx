'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400',
  secondary: 'inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800',
  ghost: 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors',
  outline: 'inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors'
};

const sizes = {
  default: 'px-5 py-3',
  sm: 'px-3 py-1.5 text-xs',
  lg: 'px-6 py-3 text-base'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const sizeClass = size !== 'default' ? sizes[size] : '';
    return <button ref={ref} className={cn(variants[variant], sizeClass, className)} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button };
