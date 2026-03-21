/**
 * 页面布局组件 - 高保真设计
 */
import React, { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  role?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已登录
    if (!user) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          useAuthStore.getState().setAuth(parsedUser, localStorage.getItem('token') || '');
        } catch (e) {
          console.error('Failed to parse user:', e);
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentRole = role || user.role || 'researcher';

  return (
    <div className="app-container">
      <Sidebar role={currentRole} />
      <div className="main-wrapper">
        <Header />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
