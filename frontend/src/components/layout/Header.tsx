/**
 * 顶部导航栏
 */
import React from 'react';
import { Avatar, Input } from 'tdesign-react';
import { SearchIcon } from 'tdesign-icons-react';
import { User } from '@/types';

interface HeaderProps {
  user: User;
  onSearch?: (keyword: string) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSearch, onLogout }) => {
  const roleLabels: Record<string, string> = {
    researcher: '研究员',
    pm: '基金经理',
    leader: '研究所领导',
    admin: '系统管理员',
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between">
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">投</span>
          </div>
          <span className="font-semibold text-gray-900">投研协作平台</span>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <Input
          placeholder="搜索公司、文档、任务..."
          prefixIcon={<SearchIcon />}
          className="w-full"
          onEnter={(e: any) => onSearch?.(e.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onLogout}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
        >
          退出
        </button>

        <div className="flex items-center gap-2">
          <Avatar size="small">{user.name?.charAt(0) || 'U'}</Avatar>
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{roleLabels[user.role] || user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;