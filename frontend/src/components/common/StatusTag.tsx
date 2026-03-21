/**
 * 状态标签组件
 */
import React from 'react';
import { Tag } from 'tdesign-react';
import {
  TaskStatus,
  TaskPriority,
  Stance,
  AlertSeverity,
  ConclusionStatus,
  PortfolioStatus,
  QuestionStatus,
} from '@/types';

type StatusType = TaskStatus | TaskPriority | Stance | AlertSeverity | ConclusionStatus | PortfolioStatus | QuestionStatus;

interface StatusTagProps {
  status: StatusType;
  type: 'task' | 'priority' | 'stance' | 'alert' | 'conclusion' | 'portfolio' | 'question';
}

const statusConfig: Record<string, { label: string; theme: string }> = {
  // Task Status
  pending: { label: '待处理', theme: 'default' },
  in_progress: { label: '进行中', theme: 'primary' },
  under_review: { label: '审核中', theme: 'warning' },
  completed: { label: '已完成', theme: 'success' },
  cancelled: { label: '已取消', theme: 'default' },

  // Priority
  P0: { label: 'P0', theme: 'danger' },
  P1: { label: 'P1', theme: 'warning' },
  P2: { label: 'P2', theme: 'default' },

  // Stance
  bullish: { label: '看好', theme: 'success' },
  neutral: { label: '中性', theme: 'primary' },
  cautious: { label: '谨慎', theme: 'warning' },
  bearish: { label: '看空', theme: 'danger' },

  // Alert
  P0: { label: 'P0', theme: 'danger' },
  P1: { label: 'P1', theme: 'warning' },
  P2: { label: 'P2', theme: 'default' },

  // Conclusion
  draft: { label: '草稿', theme: 'default' },
  published: { label: '已发布', theme: 'success' },
  archived: { label: '已归档', theme: 'default' },

  // Portfolio
  active: { label: '活跃', theme: 'success' },
  closed: { label: '已关闭', theme: 'default' },
  watchlist: { label: '观察中', theme: 'primary' },

  // Question
  open: { label: '待回答', theme: 'warning' },
  answered: { label: '已回答', theme: 'success' },
  closed: { label: '已关闭', theme: 'default' },
};

const StatusTag: React.FC<StatusTagProps> = ({ status, type }) => {
  const config = statusConfig[status] || { label: status, theme: 'default' };

  return (
    <Tag theme={config.theme as any} variant="light">
      {config.label}
    </Tag>
  );
};

export default StatusTag;