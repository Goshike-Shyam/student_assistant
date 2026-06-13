'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  neutral: 'bg-slate-100 text-slate-700'
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return <span ref={ref} className={cn(variants[variant], className)} {...props} />;
  }
);
Badge.displayName = 'Badge';
