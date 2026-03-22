/**
 * Alert组件 - TDesign封装
 */
import { Alert as TAlert } from 'tdesign-react';
import type { AlertProps } from 'tdesign-react';

export const Alert = TAlert;
export const AlertTitle = ({ children }: { children: React.ReactNode }) => <strong>{children}</strong>;
export const AlertDescription = ({ children }: { children: React.ReactNode }) => <span>{children}</span>;

export type { AlertProps };
