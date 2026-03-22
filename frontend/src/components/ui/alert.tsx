/**
 * Alert组件 - 纯HTML实现 (shadcn/ui 兼容API)
 */
import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const variantClasses: Record<string, string> = {
  default: 'bg-blue-50 border-blue-200 text-blue-800',
  destructive: 'bg-red-50 border-red-200 text-red-800',
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={`relative w-full rounded-lg border p-4 flex items-start gap-3 ${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

export const AlertTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h5 className={`font-medium leading-none tracking-tight ${className}`}>{children}</h5>
);

export const AlertDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm ${className}`}>{children}</div>
);

export type { AlertProps };
