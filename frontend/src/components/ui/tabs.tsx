/**
 * Tabs组件 - TDesign封装
 */
import { Tabs as TTabs } from 'tdesign-react';
import type { TabsProps, TabPanelProps } from 'tdesign-react';

export const Tabs = TTabs;
export const TabsContent = TTabs.TabPanel;
export const TabsList = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const TabsTrigger = ({ children, value }: { children: React.ReactNode; value: string }) => <>{children}</>;

export type { TabsProps, TabPanelProps };
