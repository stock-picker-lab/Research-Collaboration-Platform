/**
 * 登录页面
 */
'use client';
import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'tdesign-react';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'researcher', label: '研究员' },
  { value: 'pm', label: '基金经理' },
  { value: 'leader', label: '研究所领导' },
  { value: 'admin', label: '系统管理员' },
];

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('researcher');
  const router = useRouter();
  const form = React.useRef<any>(null);
  const { setAuth } = useAuthStore();

  const handleSubmit = async () => {
    setLoading(true);
    // 演示模式：直接使用选中的角色登录
    setTimeout(() => {
      const demoUsers: Record<UserRole, any> = {
        researcher: {
          id: '1',
          username: 'researcher',
          name: '研究员张三',
          email: 'researcher@example.com',
          role: 'researcher',
          team: '科技组',
          title: '高级研究员',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        pm: {
          id: '2',
          username: 'pm',
          name: '基金经理李四',
          email: 'pm@example.com',
          role: 'pm',
          team: '投资部',
          title: '基金经理',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        leader: {
          id: '3',
          username: 'leader',
          name: '研究所领导王五',
          email: 'leader@example.com',
          role: 'leader',
          team: '研究所',
          title: '研究总监',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        admin: {
          id: '4',
          username: 'admin',
          name: '系统管理员',
          email: 'admin@example.com',
          role: 'admin',
          team: 'IT部',
          title: '系统管理员',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      const user = demoUsers[selectedRole];
      const token = 'demo-token-' + selectedRole;
      setAuth(user, token);

      // 根据角色跳转到对应首页
      const roleRoutes: Record<UserRole, string> = {
        researcher: '/researcher',
        pm: '/fm',
        leader: '/leader',
        admin: '/admin',
      };
      router.push(roleRoutes[selectedRole]);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">投</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">投研协作平台</h1>
          <p className="text-gray-500 mt-2">Investment Research Platform</p>
        </div>

        <Form ref={form} labelWidth={0} layout="vertical">
          <Form.FormItem name="username">
            <Input placeholder="用户名" size="large" />
          </Form.FormItem>
          <Form.FormItem name="password">
            <Input placeholder="密码" size="large" type="password" />
          </Form.FormItem>
          <Form.FormItem name="role" label="选择角色">
            <div className="flex flex-col gap-2">
              {roleOptions.map((role) => (
                <label
                  key={role.value}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRole === role.value
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{role.label}</span>
                </label>
              ))}
            </div>
          </Form.FormItem>
          <Button
            theme="primary"
            block
            size="large"
            loading={loading}
            onClick={handleSubmit}
            className="mt-4"
          >
            登录
          </Button>
        </Form>

        <div className="mt-6 text-center text-gray-400 text-xs">
          <p>演示模式：选择角色后直接登录</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;