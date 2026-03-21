/** 系统管理员工作台 */
'use client';
import React from 'react';
import { Layout } from '@/components/layout';
import { StatCard, PageHeader } from '@/components/common';
import { AuditPage } from './AuditPage';
import { UsersPage } from './UsersPage';
import { SettingsPage } from './SettingsPage';

export const AdminDashboard: React.FC = () => (
  <Layout role="admin">
    <PageHeader title="系统管理" subtitle="平台全局配置和用户管理" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
      <StatCard title="用户总数" value={50} color="primary" />
      <StatCard title="活跃用户" value={35} color="success" />
      <StatCard title="系统日志" value={120} color="warning" />
      <StatCard title="数据源" value={8} color="danger" />
    </div>
  </Layout>
);
export { AuditPage, UsersPage, SettingsPage };
export default AdminDashboard;