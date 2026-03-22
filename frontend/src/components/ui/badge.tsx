/**
 * Badge组件 - 纯HTML实现 (shadcn/ui 兼容API)
 */
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const variantClasses: Record<string, string> = {
  default: 'bg-blue-600 text-white',
  secondary: 'bg-gray-100 text-gray-800',
  outline: 'border border-gray-300 text-gray-700 bg-transparent',
  destructive: 'bg-red-600 text-white',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export type { BadgeProps };
