/**
 * 侧边导航栏
 */
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  DashboardIcon,
  FileIcon,
  TaskIcon,
  UserIcon,
  FolderIcon,
  ChartBarIcon,
  SettingIcon,
} from 'tdesign-icons-react';
import { UserRole } from '@/types';

interface SidebarProps {
  role: UserRole;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

interface MenuItem {
  value: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const roleMenus: Record<UserRole, MenuItem[]> = {
  researcher: [
    { value: 'dashboard', label: '工作台', icon: <DashboardIcon />, path: '/researcher' },
    { value: 'documents', label: '文档库', icon: <FileIcon />, path: '/researcher/documents' },
    { value: 'tasks', label: '研究任务', icon: <TaskIcon />, path: '/researcher/tasks' },
    { value: 'conclusions', label: '研报结论', icon: <FileIcon />, path: '/researcher/conclusions' },
    { value: 'companies', label: '关注公司', icon: <FolderIcon />, path: '/researcher/companies' },
    { value: 'questions', label: '问答协作', icon: <UserIcon />, path: '/researcher/questions' },
    { value: 'alerts', label: '我的预警', icon: <ChartBarIcon />, path: '/researcher/alerts' },
  ],
  pm: [
    { value: 'dashboard', label: '工作台', icon: <DashboardIcon />, path: '/fm' },
    { value: 'portfolio', label: '持仓管理', icon: <FolderIcon />, path: '/fm/portfolio' },
    { value: 'watchlist', label: '观察池', icon: <ChartBarIcon />, path: '/fm/watchlist' },
    { value: 'documents', label: '文档库', icon: <FileIcon />, path: '/fm/documents' },
    { value: 'conclusions', label: '研报结论', icon: <FileIcon />, path: '/fm/conclusions' },
    { value: 'questions', label: '问答协作', icon: <UserIcon />, path: '/fm/questions' },
  ],
  leader: [
    { value: 'dashboard', label: '工作台', icon: <DashboardIcon />, path: '/leader' },
    { value: 'tasks', label: '任务管理', icon: <TaskIcon />, path: '/leader/tasks' },
    { value: 'team', label: '团队管理', icon: <UserIcon />, path: '/leader/team' },
    { value: 'documents', label: '文档库', icon: <FileIcon />, path: '/leader/documents' },
    { value: 'conclusions', label: '研报结论', icon: <FileIcon />, path: '/leader/conclusions' },
    { value: 'questions', label: '问答协作', icon: <UserIcon />, path: '/leader/questions' },
    { value: 'output', label: '产出统计', icon: <ChartBarIcon />, path: '/leader/output' },
    { value: 'datasource', label: '数据源', icon: <SettingIcon />, path: '/leader/datasource' },
    { value: 'settings', label: '系统设置', icon: <SettingIcon />, path: '/leader/settings' },
  ],
  admin: [
    { value: 'dashboard', label: '工作台', icon: <DashboardIcon />, path: '/admin' },
    { value: 'users', label: '用户管理', icon: <UserIcon />, path: '/admin/users' },
    { value: 'audit', label: '审计日志', icon: <SettingIcon />, path: '/admin/audit' },
    { value: 'settings', label: '系统设置', icon: <SettingIcon />, path: '/admin/settings' },
  ],
};

const Sidebar: React.FC<SidebarProps> = ({ role, collapsed = false }) => {
  const router = useRouter();
  const pathname = usePathname();

  const menus = roleMenus[role] || [];

  const handleNavChange = (value: string) => {
    const menu = menus.find((m) => m.value === value);
    if (menu) {
      router.push(menu.path);
    }
  };

  // 获取当前选中的值
  const currentPath = pathname;
  const selectedValue = menus.find((m) => currentPath.startsWith(m.path))?.value || 'dashboard';

  return (
    <aside className={`min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
      <nav className="py-4">
        {menus.map((menu) => (
          <div
            key={menu.value}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
              selectedValue === menu.value
                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => handleNavChange(menu.value)}
          >
            <span className="text-lg">{menu.icon}</span>
            {!collapsed && <span className="text-sm font-medium">{menu.label}</span>}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;