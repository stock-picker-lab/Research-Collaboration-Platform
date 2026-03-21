/**
 * 研究员工作台 - 高保真设计
 */
'use client';
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

interface TodoItem {
  id: string;
  title: string;
  company?: string;
  type?: string;
  deadline?: string;
  priority: 'p0' | 'p1' | 'p2' | 'qa';
  status?: string;
}

interface CompanyItem {
  id: string;
  name: string;
  ticker: string;
  rating: 'buy' | 'hold' | 'sell';
  newDocs: number;
  industry: string;
}

export const ResearcherWorkspace: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟加载
    setTimeout(() => setLoading(false), 300);
  }, []);

  // 模拟数据
  const todoItems: TodoItem[] = [
    {
      id: '1',
      title: '贵州茅台Q4财报点评',
      company: '贵州茅台',
      type: '财报点评',
      deadline: '今日 18:00',
      priority: 'p0',
    },
    {
      id: '2',
      title: '宁德时代新产品发布会纪要',
      company: '宁德时代',
      type: '事件点评',
      deadline: '今日 18:00',
      priority: 'p1',
    },
    {
      id: '3',
      title: '比亚迪同行对比更新',
      company: '比亚迪',
      type: '同行对比',
      deadline: '明日',
      priority: 'p2',
    },
    {
      id: '4',
      title: '回复李经理关于隆基股份的提问',
      company: '隆基绿能',
      type: '问答',
      priority: 'qa',
    },
  ];

  const coverageCompanies: CompanyItem[] = [
    { id: '1', name: '贵州茅台', ticker: '600519', rating: 'buy', newDocs: 3, industry: '食品饮料' },
    { id: '2', name: '宁德时代', ticker: '300750', rating: 'buy', newDocs: 5, industry: '新能源' },
    { id: '3', name: '比亚迪', ticker: '002594', rating: 'hold', newDocs: 2, industry: '汽车' },
    { id: '4', name: '隆基绿能', ticker: '601012', rating: 'buy', newDocs: 1, industry: '光伏' },
    { id: '5', name: '药明康德', ticker: '603259', rating: 'hold', newDocs: 0, industry: '医药' },
  ];

  const quickActions = [
    { icon: '📈', name: '个股深度研究', desc: '启动标准研究流程' },
    { icon: '📊', name: '财报快速点评', desc: '使用AI辅助分析' },
    { icon: '📰', name: '事件点评', desc: '快速响应突发事件' },
    { icon: '⚖️', name: '同行对比', desc: '横向对比多家公司' },
  ];

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'p0': return 'tag tag-p0';
      case 'p1': return 'tag tag-p1';
      case 'p2': return 'tag tag-p2';
      case 'qa': return 'tag tag-blue';
      default: return 'tag tag-gray';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'p0': return 'P0 紧急';
      case 'p1': return 'P1 重要';
      case 'p2': return 'P2 常规';
      case 'qa': return '问答';
      default: return priority;
    }
  };

  const getBorderStyle = (priority: string) => {
    switch (priority) {
      case 'p0': return 'border-left: 4px solid var(--red);';
      case 'p1': return 'border-left: 4px solid var(--orange);';
      case 'p2': return 'border-left: 4px solid var(--green);';
      default: return '';
    }
  };

  const getRatingClass = (rating: string) => {
    switch (rating) {
      case 'buy': return 'badge-rating badge-buy';
      case 'hold': return 'badge-rating badge-hold';
      case 'sell': return 'badge-rating badge-sell';
      default: return 'badge-rating';
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'buy': return '买入';
      case 'hold': return '持有';
      case 'sell': return '卖出';
      default: return rating;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早安';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const filters = ['全部', '紧急', '跟进'];

  const filteredTodos = todoItems.filter((item) => {
    if (activeFilter === '全部') return true;
    if (activeFilter === '紧急') return item.priority === 'p0' || item.priority === 'p1';
    if (activeFilter === '跟进') return item.priority === 'p2' || item.priority === 'qa';
    return true;
  });

  if (loading) {
    return (
      <Layout role="researcher">
        <div className="page-content flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="researcher">
      <div className="page-content">
        {/* 页面标题区 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 className="page-title">{getGreeting()}，{user?.name?.split('')[0] || '研究员'} 👋</h1>
            <p className="page-subtitle">今日待办 {todoItems.length} 项 · 覆盖池 {coverageCompanies.length} 家公司 · 新增变化 12 条</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline">🎯 专注模式</button>
            <button className="btn btn-primary">+ 新建研究</button>
          </div>
        </div>

        {/* 双列网格：待办 + 覆盖池 */}
        <div className="grid-2">
          {/* 左侧：今日待办 */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📝 今日待办</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {filters.map((f) => (
                  <span
                    key={f}
                    className={`filter-item ${activeFilter === f.toLowerCase() || (activeFilter === 'all' && f === '全部') ? 'active' : ''}`}
                    onClick={() => setActiveFilter(f === '全部' ? 'all' : f === '紧急' ? 'urgent' : 'follow')}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {filteredTodos.map((item) => {
              const getBorderColor = () => {
                switch (item.priority) {
                  case 'p0': return 'var(--red)';
                  case 'p1': return 'var(--orange)';
                  case 'p2': return 'var(--green)';
                  default: return 'transparent';
                }
              };

              return (
                <div key={item.id} className="list-item" style={{ borderLeft: `4px solid ${getBorderColor()}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className={getPriorityClass(item.priority)}>{getPriorityLabel(item.priority)}</span>
                      <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{item.title}</strong>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {item.deadline ? `${item.company} · ${item.type} · ${item.deadline}` : `${item.company} · ${item.type}`}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      if (item.priority === 'qa') {
                        router.push('/researcher/questions');
                      } else {
                        router.push('/researcher/tasks');
                      }
                    }}
                  >
                    {item.priority === 'qa' ? '回复' : '立即处理'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* 右侧：覆盖池概览 */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📦 覆盖池概览</span>
              <button className="btn btn-sm btn-outline" onClick={() => router.push('/researcher/companies')}>
                管理覆盖池
              </button>
            </div>

            <div className="grid-3">
              {coverageCompanies.map((company) => (
                <div
                  key={company.id}
                  className="company-card"
                  onClick={() => router.push(`/researcher/companies/${company.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <strong className="company-name">{company.name}</strong>
                    <span className={getRatingClass(company.rating)}>{getRatingLabel(company.rating)}</span>
                  </div>
                  <div className="company-ticker">{company.industry} · {company.ticker}</div>
                  <div className="company-updates">
                    {company.newDocs > 0 ? (
                      <>
                        <span style={{ color: 'var(--gold)', fontWeight: 600 }}>+{company.newDocs}</span>
                        <span>新增资料</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>暂无更新</span>
                    )}
                  </div>
                </div>
              ))}

              {/* 添加公司卡片 */}
              <div
                className="company-card"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}
                onClick={() => router.push('/researcher/companies')}
              >
                + 添加公司
              </div>
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚡ 快捷操作</span>
          </div>
          <div className="grid-4">
            {quickActions.map((action, idx) => (
              <div key={idx} className="template-card">
                <div className="template-icon">{action.icon}</div>
                <div className="template-name">{action.name}</div>
                <div className="template-desc">{action.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
