/**
 * Button组件 - 纯HTML实现 (shadcn/ui 兼容API)
 */
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const variantClasses: Record<string, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
  ghost: 'bg-transparent hover:bg-gray-100',
  link: 'bg-transparent text-blue-600 underline-offset-4 hover:underline',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
};

const sizeClasses: Record<string, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-sm',
  lg: 'h-12 rounded-md px-8',
  icon: 'h-10 w-10',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default} ${className}`}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export type { ButtonProps };
