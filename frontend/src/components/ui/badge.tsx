/**
 * Badge组件 - TDesign封装
 */
import { Badge as TBadge, Tag } from 'tdesign-react';
import type { BadgeProps, TagProps } from 'tdesign-react';

export const Badge = TBadge;
// Tag 也可以用作 Badge
export { Tag };

export type { BadgeProps, TagProps };
