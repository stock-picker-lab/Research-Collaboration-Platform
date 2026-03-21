/**
 * 顶部导航栏 - 高保真设计
 */
import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePathname } from 'next/navigation';

const roleBreadcrumbs: Record<string, { prefix: string; name: string }> = {
  researcher: { prefix: '研究员工作台', name: '首页' },
  pm: { prefix: '基金经理', name: '决策驾驶舱' },
  leader: { prefix: '管理层', name: '团队看板' },
  admin: { prefix: '系统管理', name: '管理首页' },
};

interface HeaderProps {
  user?: any;
}

const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState('');

  // 从路径推导角色
  const pathParts = pathname.split('/');
  const role = pathParts[1] || 'researcher';
  const breadcrumb = roleBreadcrumbs[role] || { prefix: role, name: '首页' };

  // 获取页面名称
  const getPageName = () => {
    const pageMap: Record<string, string> = {
      '': '首页',
      'companies': '关注公司',
      'documents': '文档库',
      'tasks': '研究任务',
      'conclusions': '研报结论',
      'questions': '问答协作',
      'alerts': '我的预警',
      'portfolio': '持仓管理',
      'watchlist': '观察池',
      'team': '团队管理',
      'output': '产出统计',
      'coverage': '覆盖情况',
      'users': '用户权限',
      'audit': '审计日志',
      'datasource': '数据源',
      'settings': '系统设置',
    };
    const subPath = pathParts[2] || '';
    return pageMap[subPath] || '首页';
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      console.log('Search:', searchValue);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        {/* 面包屑 */}
        <div className="breadcrumb">
          {breadcrumb.prefix} / <span>{getPageName()}</span>
        </div>

        {/* 搜索框 */}
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="搜索公司、文档、研究报告..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="top-nav-right">
        {/* 通知 */}
        <div className="notification">
          🔔
          <span className="badge">5</span>
        </div>

        {/* 用户头像 */}
        <div className="user-avatar" onClick={handleLogout} title="点击退出">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;
