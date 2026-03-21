/**
 * 侧边导航栏 - 高保真设计
 */
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: Record<string, NavSection[]> = {
  researcher: [
    {
      title: '🔬 研究员侧',
      items: [
        { id: 'home', label: '首页工作台', icon: '🏠', path: '/researcher' },
        { id: 'companies', label: '关注公司', icon: '🏢', path: '/researcher/companies' },
        { id: 'documents', label: '文档库', icon: '📄', path: '/researcher/documents' },
        { id: 'tasks', label: '研究任务', icon: '📋', path: '/researcher/tasks' },
        { id: 'conclusions', label: '研报结论', icon: '🎯', path: '/researcher/conclusions' },
        { id: 'questions', label: '问答协作', icon: '💬', path: '/researcher/questions' },
        { id: 'alerts', label: '我的预警', icon: '🔔', path: '/researcher/alerts' },
      ],
    },
  ],
  pm: [
    {
      title: '💼 基金经理侧',
      items: [
        { id: 'dashboard', label: '决策驾驶舱', icon: '🎛️', path: '/fm' },
        { id: 'portfolio', label: '持仓管理', icon: '📦', path: '/fm/portfolio' },
        { id: 'watchlist', label: '观察池', icon: '👁️', path: '/fm/watchlist' },
        { id: 'documents', label: '文档库', icon: '📄', path: '/fm/documents' },
        { id: 'conclusions', label: '研报结论', icon: '📝', path: '/fm/conclusions' },
        { id: 'questions', label: '问答追踪', icon: '❓', path: '/fm/questions' },
      ],
    },
  ],
  leader: [
    {
      title: '👔 管理层侧',
      items: [
        { id: 'dashboard', label: '团队看板', icon: '📊', path: '/leader' },
        { id: 'tasks', label: '任务管理', icon: '✅', path: '/leader/tasks' },
        { id: 'team', label: '团队管理', icon: '👥', path: '/leader/team' },
        { id: 'documents', label: '文档库', icon: '📄', path: '/leader/documents' },
        { id: 'conclusions', label: '研报结论', icon: '🎯', path: '/leader/conclusions' },
        { id: 'questions', label: '问答协作', icon: '💬', path: '/leader/questions' },
        { id: 'output', label: '产出统计', icon: '📈', path: '/leader/output' },
        { id: 'coverage', label: '覆盖情况', icon: '🗺️', path: '/leader/coverage' },
      ],
    },
  ],
  admin: [
    {
      title: '⚙️ 系统管理侧',
      items: [
        { id: 'dashboard', label: '管理首页', icon: '🏠', path: '/admin' },
        { id: 'users', label: '用户权限', icon: '👥', path: '/admin/users' },
        { id: 'audit', label: '审计日志', icon: '📜', path: '/admin/audit' },
        { id: 'datasource', label: '数据源', icon: '🔌', path: '/admin/datasource' },
        { id: 'settings', label: '系统设置', icon: '⚙️', path: '/admin/settings' },
      ],
    },
  ],
};

interface SidebarProps {
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const router = useRouter();
  const pathname = usePathname();
  const sections = navSections[role] || [];

  const isActive = (path: string) => {
    if (path === `/${role}`) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      {/* Logo区域 */}
      <div className="sidebar-header">
        <h1>📊 投研协作平台</h1>
        <p>Investment Research Platform</p>
      </div>

      {/* 导航区域 */}
      <nav>
        {sections.map((section, idx) => (
          <div key={idx} className="nav-section">
            <div className="nav-section-title">{section.title}</div>
            {section.items.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => router.push(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
