/**
 * 研究员 - 研究任务页面
 */
'use client';
import React, { useState } from 'react';
import { Card, Button, Tag } from 'tdesign-react';
import { AddIcon } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader, StatusTag } from '@/components/common';

interface Task {
  id: string;
  title: string;
  company: string;
  type: string;
  status: string;
  due_date: string;
}

export const TasksPage: React.FC = () => {
  const [tasks] = useState<Task[]>([
    { id: '1', title: '完成宁德时代深度研究', company: '宁德时代', type: '深度研究', status: 'in_progress', due_date: '2026-03-25' },
    { id: '2', title: '光伏行业政策跟踪', company: '隆基绿能', type: '事件点评', status: 'pending', due_date: '2026-03-28' },
  ]);

  return (
    <Layout role="researcher">
      <PageHeader title="研究任务" subtitle="管理您负责的研究任务" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button theme="primary" icon={<AddIcon />}>创建任务</Button>
      </div>
      <Card bordered>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map((task) => (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', border: '1px solid #eee', borderRadius: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{task.title}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{task.company} · {task.type} · {task.due_date}</div>
              </div>
              <StatusTag status={task.status} type="task" />
            </div>
          ))}
        </div>
      </Card>
    </Layout>
  );
};

export default TasksPage;