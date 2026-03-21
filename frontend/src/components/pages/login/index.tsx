/**
 * 登录页面
 */
'use client';
import React, { useState } from 'react';
import { Input, Button, Card, Select } from 'tdesign-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';

const roleOptions = [
  { value: 'researcher', label: '研究员' },
  { value: 'pm', label: '基金经理' },
  { value: 'leader', label: '研究所领导' },
  { value: 'admin', label: '系统管理员' },
];

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('researcher');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const demoUsers: Record<string, any> = {
    researcher: {
      id: '1', username: 'researcher1', name: '张研究员',
      email: 'r1@research.com', role: 'researcher', team: 'TMT',
      title: '高级研究员', is_active: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    pm: {
      id: '4', username: 'pm1', name: '王基金经理',
      email: 'pm1@research.com', role: 'pm', team: '权益一部',
      title: '基金经理', is_active: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    leader: {
      id: '5', username: 'leader1', name: '赵所长',
      email: 'leader1@research.com', role: 'leader', team: '研究所',
      title: '研究总监', is_active: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    admin: {
      id: '1', username: 'admin', name: '系统管理员',
      email: 'admin@research.com', role: 'admin', team: 'system',
      title: '系统管理员', is_active: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
  };

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Try real API first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuth(data.user, data.access_token);
        router.push(`/${data.user.role}`);
        return;
      }
      // Fallback: demo mode if API fails
      const demoUsername = username.toLowerCase();
      if (password === 'demo123') {
        const user = { ...demoUsers[selectedRole], username: demoUsername, name: username };
        const token = 'demo-token-' + selectedRole;
        setAuth(user, token);
        router.push(`/${selectedRole}`);
        return;
      }
      const data = await response.json();
      setError(data.detail || '用户名或密码错误');
    } catch {
      // Network error - use demo mode
      if (password === 'demo123') {
        const user = { ...demoUsers[selectedRole], username: demoUsername, name: username };
        const token = 'demo-token-' + selectedRole;
        setAuth(user, token);
        router.push(`/${selectedRole}`);
        return;
      }
      setError('无法连接服务器，请检查网络或使用演示模式');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">投研协作平台</h1>
            <p className="text-blue-300 text-sm tracking-wider">Investment Research Platform</p>
          </div>

          {/* Card */}
          <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">用户名</label>
                <Input
                  placeholder="请输入用户名"
                  size="large"
                  value={username}
                  onChange={(value) => setUsername(value as string)}
                  prefixIcon={
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                  className="[&.t-is-focused]:!bg-white/20 ![&_.t-input]:!bg-white/10 ![&_.t-input]:!border-white/30 ![&_.t-input]:!text-white ![&_.t-input__inner]::!text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">密码</label>
                <Input
                  placeholder="请输入密码"
                  size="large"
                  type="password"
                  value={password}
                  onChange={(value) => setPassword(value as string)}
                  onEnterKeyDown={() => handleSubmit()}
                  prefixIcon={
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                  className="[&.t-is-focused]:!bg-white/20 ![&_.t-input]:!bg-white/10 ![&_.t-input]:!border-white/30 ![&_.t-input]:!text-white ![&_.t-input__inner]::!text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-100 mb-2">选择角色（演示模式）</label>
                <Select
                  value={selectedRole}
                  onChange={(value) => setSelectedRole(value as string)}
                  options={roleOptions}
                  size="large"
                  className="[&_.t-select__wrap]:!bg-white/10 [&_.t-select__wrap]:!border-white/30 [&_.t-input]:!bg-white/10 [&_.t-input]:!border-white/30"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <Button
                theme="primary"
                block
                size="large"
                loading={loading}
                onClick={handleSubmit}
                className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 !border-0 !text-white hover:!from-blue-500 hover:!to-indigo-500 h-12 text-base font-medium"
              >
                登 录
              </Button>
            </div>

            <div className="px-6 py-4 border-t border-white/10 text-center">
              <p className="text-blue-200/60 text-xs space-y-1">
                <span>演示模式密码: demo123</span>
                <br />
                <span>真实账号: admin / admin123</span>
              </p>
            </div>
          </Card>

          <p className="text-center text-blue-200/40 text-xs mt-6">
            © 2024 投研协作平台
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
