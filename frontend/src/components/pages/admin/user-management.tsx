import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Shield
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'fm' | 'researcher';
  status: 'active' | 'inactive';
  lastLogin: string;
}

const UserManagementPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const users: User[] = [
    {
      id: '1',
      name: '张研究员',
      email: 'zhang@company.com',
      role: 'researcher',
      status: 'active',
      lastLogin: '2026-03-20 10:30'
    },
    {
      id: '2',
      name: '李基金经理',
      email: 'li@company.com',
      role: 'fm',
      status: 'active',
      lastLogin: '2026-03-20 09:15'
    },
    {
      id: '3',
      name: '王主管',
      email: 'wang@company.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2026-03-19 16:45'
    },
    {
      id: '4',
      name: '管理员',
      email: 'admin@company.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2026-03-20 14:20'
    }
  ];

  const getRoleBadge = (role: string) => {
    const roleMap = {
      admin: { label: '系统管理员', color: 'bg-red-100 text-red-700' },
      manager: { label: '管理层', color: 'bg-purple-100 text-purple-700' },
      fm: { label: '基金经理', color: 'bg-blue-100 text-blue-700' },
      researcher: { label: '研究员', color: 'bg-green-100 text-green-700' }
    };
    const config = roleMap[role as keyof typeof roleMap];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-700">活跃</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-700">停用</Badge>
    );
  };

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">用户权限管理</h2>
            <p className="text-sm text-gray-600">
              管理系统用户和角色权限
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            添加用户
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索用户名称或邮箱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">用户</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">邮箱</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">角色</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">状态</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">最后登录</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {user.name[0]}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 text-center">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4 text-center">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-700">{user.lastLogin}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagementPage;