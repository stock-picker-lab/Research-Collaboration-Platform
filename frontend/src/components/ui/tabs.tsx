/**
 * Tabs组件 - 纯HTML/React实现 (shadcn/ui 兼容API)
 */
'use client';

import React, { createContext, useContext, useState } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType>({ value: '', onValueChange: () => {} });

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = ({ className = '', defaultValue = '', value, onValueChange, children, ...props }: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;
  const handleChange = onValueChange ?? setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
    {...props}
  >
    {children}
  </div>
);

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = ({ className = '', value, children, ...props }: TabsTriggerProps) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isActive = selectedValue === value;

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
        isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      } ${className}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = ({ className = '', value, children, ...props }: TabsContentProps) => {
  const { value: selectedValue } = useContext(TabsContext);
  if (selectedValue !== value) return null;

  return (
    <div className={`mt-2 ${className}`} {...props}>
      {children}
    </div>
  );
};
