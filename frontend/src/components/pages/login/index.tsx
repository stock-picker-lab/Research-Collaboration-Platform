/**
 * 登录页面 - 高保真设计
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
        const user = { ...demoUsers[selectedRole], username: username.toLowerCase(), name: username };
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
        const user = { ...demoUsers[selectedRole], username: username.toLowerCase(), name: username };
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
    <div className="min-h-screen relative overflow-hidden login-bg">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full" style={{ maxWidth: '440px' }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #D4AF37 0%, #F0D875 50%, #D4AF37 100%)',
                borderRadius: '20px',
                marginBottom: 24,
                boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)',
              }}
            >
              <span style={{ fontSize: '40px' }}>📊</span>
            </div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: 'white',
                marginBottom: 8,
                letterSpacing: '-0.5px',
              }}
            >
              投研协作平台
            </h1>
            <p
              style={{
                color: 'rgba(212, 175, 55, 0.9)',
                fontSize: '14px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Investment Research Platform
            </p>
          </div>

          {/* Login card */}
          <Card
            style={{
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ padding: '28px 32px' }}>
              {/* Username */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#1A365D',
                    marginBottom: 8,
                  }}
                >
                  用户名
                </label>
                <Input
                  placeholder="请输入用户名"
                  size="large"
                  value={username}
                  onChange={(value) => setUsername(value as string)}
                  style={{
                    width: '100%',
                    '--td-bg-color': '#F7FAFC',
                    '--td-border-color': '#E2E8F0',
                    '--td-text-color': '#2D3748',
                  } as any}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#1A365D',
                    marginBottom: 8,
                  }}
                >
                  密码
                </label>
                <Input
                  placeholder="请输入密码"
                  size="large"
                  type="password"
                  value={password}
                  onChange={(value) => setPassword(value as string)}
                  onKeydown={(e: any) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                  style={{
                    width: '100%',
                    '--td-bg-color': '#F7FAFC',
                    '--td-border-color': '#E2E8F0',
                    '--td-text-color': '#2D3748',
                  } as any}
                />
              </div>

              {/* Role selector */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#1A365D',
                    marginBottom: 8,
                  }}
                >
                  选择角色（演示模式）
                </label>
                <Select
                  value={selectedRole}
                  onChange={(value) => setSelectedRole(value as string)}
                  options={roleOptions}
                  size="large"
                  style={{
                    width: '100%',
                    '--td-bg-color': '#F7FAFC',
                    '--td-border-color': '#E2E8F0',
                  } as any}
                />
              </div>

              {/* Error message */}
              {error && (
                <div
                  style={{
                    padding: '12px',
                    background: '#FEE2E2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    color: '#991B1B',
                    fontSize: '14px',
                    marginBottom: 16,
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'linear-gradient(135deg, #1A365D 0%, #2C5282 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <span>登录中...</span>
                ) : (
                  <>
                    <span>登 录</span>
                    <span style={{ fontSize: '18px' }}>→</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E2E8F0',
                textAlign: 'center',
                background: '#F7FAFC',
                borderRadius: '0 0 16px 16px',
              }}
            >
              <p style={{ color: '#718096', fontSize: '12px', margin: 0 }}>
                <span>演示模式密码: demo123</span>
                <br />
                <span>真实账号: admin / admin123</span>
              </p>
            </div>
          </Card>

          {/* Copyright */}
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '12px',
              marginTop: 24,
            }}
          >
            © 2024 投研协作平台 · Investment Research Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
