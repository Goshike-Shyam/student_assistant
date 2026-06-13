'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400',
  secondary: 'inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return <button ref={ref} className={cn(variants[variant], className)} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button };
