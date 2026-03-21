/**
 * 页面布局组件
 */
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/authStore';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 如果没有用户数据，尝试从 localStorage 恢复
    if (!user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          useAuthStore.getState().setAuth(parsedUser, localStorage.getItem('token') || '');
        } catch (e) {
          console.error('Failed to parse user:', e);
        }
      }
    }
    setLoading(false);
  }, [user]);

  const handleSearch = (keyword: string) => {
    console.log('Search:', keyword);
    // 实现搜索逻辑
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSearch={handleSearch} onLogout={handleLogout} />
      <div className="flex">
        <Sidebar role={role} collapsed={collapsed} onCollapse={setCollapsed} />
        <main className="flex-1 min-h-[calc(100vh-64px)]">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;