/**
 * 研究员工作台
 */
'use client';
import React, { useState, useEffect } from 'react';
import { Card, Badge, Avatar, Empty } from 'tdesign-react';
import { FileIcon, TaskIcon, ChartBarIcon, TimeIcon } from 'tdesign-icons-react';
import { Layout } from '@/components/layout';
import { StatCard, PageHeader, StatusTag } from '@/components/common';

interface DashboardData {
  todo_count: number;
  coverage_count: number;
  changes_count: number;
  recent_todos: any[];
  coverage_companies: any[];
  recent_alerts: any[];
}

export const ResearcherWorkspace: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setData({
        todo_count: 5,
        coverage_count: 12,
        changes_count: 3,
        recent_todos: [
          { id: '1', title: '完成宁德时代研究报告', company: { name: '宁德时代' }, type: '深度研究', due_date: '2026-03-25', status: 'in_progress' },
          { id: '2', title: '跟进光伏行业政策变化', company: { name: '隆基绿能' }, type: '事件点评', due_date: '2026-03-22', status: 'pending' },
        ],
        coverage_companies: [
          { id: '1', name: '宁德时代', rating: '增持', new_docs: 2 },
          { id: '2', name: '隆基绿能', rating: '中性', new_docs: 1 },
        ],
        recent_alerts: [
          { id: '1', title: '宁德时代季报超预期', content: 'Q4净利润同比增长45%', severity: 'P1', company: { name: '宁德时代' }, created_at: '2小时前' },
          { id: '2', title: '光伏政策调整', content: '组件出口关税变化', severity: 'P2', company: { name: '隆基绿能' }, created_at: '5小时前' },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  return (
    <Layout role="researcher">
      <PageHeader
        title="工作台"
        subtitle="欢迎回来！查看您的工作任务和关注公司的最新动态"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 24 }}>
        <StatCard
          title="待完成任务"
          value={data?.todo_count || 0}
          trend={{ value: 12, isUp: true }}
          icon={<TaskIcon />}
          color="warning"
        />
        <StatCard
          title="覆盖公司"
          value={data?.coverage_count || 0}
          icon={<FileIcon />}
          color="primary"
        />
        <StatCard
          title="今日变化"
          value={data?.changes_count || 0}
          trend={{ value: 5, isUp: false }}
          icon={<ChartBarIcon />}
          color="success"
        />
        <StatCard
          title="新预警"
          value={data?.recent_alerts?.length || 0}
          icon={<TimeIcon />}
          color="danger"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
        <Card title="待办任务" bordered>
          {data?.recent_todos && data.recent_todos.length > 0 ? (
            data.recent_todos.map((task) => (
              <div key={task.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ fontWeight: 500 }}>{task.title}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {task.company?.name} · {task.type} · {task.due_date}
                </div>
                <StatusTag status={task.status} type="task" />
              </div>
            ))
          ) : (
            <Empty description="暂无待办任务" />
          )}
        </Card>

        <Card title="关注公司动态" bordered>
          {data?.coverage_companies && data.coverage_companies.length > 0 ? (
            data.coverage_companies.map((company: any) => (
              <div key={company.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                <Avatar size="small">{company.name?.charAt(0)}</Avatar>
                <div style={{ marginLeft: 12, flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{company.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusTag status={company.rating} type="stance" />
                    {company.new_docs > 0 && <Badge count={company.new_docs} />}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <Empty description="暂无关注公司" />
          )}
        </Card>
      </div>

      <Card title="最新预警" bordered style={{ marginTop: 24 }}>
        {data?.recent_alerts && data.recent_alerts.length > 0 ? (
          data.recent_alerts.map((alert) => (
            <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: alert.severity === 'P0' ? 'var(--td-error-color)' : alert.severity === 'P1' ? 'var(--td-warning-color)' : 'var(--td-brand-color)',
                marginRight: 12,
                marginTop: 6,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{alert.title}</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{alert.content}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  {alert.company?.name} · {alert.created_at}
                </div>
              </div>
              <StatusTag status={alert.severity} type="alert" />
            </div>
          ))
        ) : (
          <Empty description="暂无预警" />
        )}
      </Card>
    </Layout>
  );
};

// Re-export all page components
export { AlertsPage } from './alerts';
export { CompaniesPage } from './companies';
export { ConclusionsPage } from './conclusions';
export { DocumentsPage } from './documents';
export { QuestionsPage } from './questions';
export { TasksPage } from './tasks';

export default ResearcherWorkspace;