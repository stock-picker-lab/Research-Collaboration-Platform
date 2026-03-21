/**
 * 基金经理决策驾驶舱 - 高保真设计
 */
'use client';
import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

export const FMDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mode, setMode] = useState<'normal' | 'earnings'>('normal');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const todayChanges = [
    {
      id: '1',
      company: '贵州茅台',
      event: 'Q4财报已发布',
      position: '8.5%',
      priority: 'p0',
    },
    {
      id: '2',
      company: '宁德时代',
      event: '新产品发布会',
      position: '6.2%',
      priority: 'p1',
    },
    {
      id: '3',
      company: '比亚迪',
      event: '月度销量数据更新',
      position: '5.8%',
      priority: 'p1',
    },
  ];

  return (
    <Layout role="pm">
      <div className="page-content">
        {/* 页面标题 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="page-title">{getGreeting()}，{user?.name?.split('')[0] || '基金经理'} 👋</h1>
            <p className="page-subtitle">持仓 15 只 · 观察池 28 只 · 今日重点变化 6 条</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={`btn btn-sm ${mode === 'normal' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMode('normal')}
            >
              日常模式
            </button>
            <button
              className={`btn btn-sm ${mode === 'earnings' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setMode('earnings')}
            >
              财报季模式
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid-4">
          <div className="card stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>15</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>持仓标的</div>
            <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>↑ 2 本周新增</div>
          </div>
          <div className="card stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--red)' }}>6</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>今日重点变化</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>3个P0 + 3个P1</div>
          </div>
          <div className="card stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--orange)' }}>5</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>待答复问题</div>
            <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 8 }}>↓ 2 较昨日</div>
          </div>
          <div className="card stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--green)' }}>92%</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>研究覆盖率</div>
            <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>↑ 5%</div>
          </div>
        </div>

        {/* 双列网格 */}
        <div className="grid-2">
          {/* 今日重点变化 */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">⚡ 今日重点变化</span>
            </div>
            {todayChanges.map((item) => (
              <div
                key={item.id}
                className="list-item"
                style={{
                  borderLeft: `4px solid ${item.priority === 'p0' ? 'var(--red)' : 'var(--orange)'}`,
                }}
              >
                <span className={`tag ${item.priority === 'p0' ? 'tag-p0' : 'tag-p1'}`}>
                  {item.priority === 'p0' ? 'P0' : 'P1'}
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{item.company}</strong>
                  <br />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    持仓 {item.position} · {item.event}
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => router.push('/fm/portfolio')}
                >
                  查看
                </button>
              </div>
            ))}
          </div>

          {/* 问题追踪状态 */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">❓ 问题追踪状态</span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: 16,
                  background: '#FEEBC8',
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--orange)' }}>5</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>待答复</div>
              </div>
              <div
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: 16,
                  background: '#BEE3F8',
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, color: '#2B6CB0' }}>12</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>已答复</div>
              </div>
              <div
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: 16,
                  background: '#E2E8F0',
                  borderRadius: 8,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, color: '#4A5568' }}>28</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>已关闭</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Re-export all page components
export { ConclusionsPage } from './conclusions';
export { DocumentsPage } from './documents';
export { PortfolioPage } from './portfolio';
export { QuestionsPage } from './questions';
export { WatchlistPage } from './watchlist';

export default FMDashboard;
