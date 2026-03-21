'use client';
import React from 'react';
import { Card, Table, Tag, Button, Input, Select } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';
import { AddIcon } from 'tdesign-icons-react';

const users = [
  { id: 1, username: 'zhangsan', name: '张三', role: '研究员', team: '科技组', email: 'zhangsan@fund.com', status: 'active' },
  { id: 2, username: 'lisi', name: '李四', role: '研究员', team: '周期组', email: 'lisi@fund.com', status: 'active' },
  { id: 3, username: 'wangwu', name: '王五', role: '基金经理', team: '-', email: 'wangwu@fund.com', status: 'active' },
  { id: 4, username: 'zhaoliu', name: '赵六', role: '研究所领导', team: '管理组', email: 'zhaoliu@fund.com', status: 'active' },
  { id: 5, username: 'admin', name: '系统管理员', role: '管理员', team: '-', email: 'admin@fund.com', status: 'active' },
];

const roleOptions = [
  { value: 'all', label: '全部角色' },
  { value: 'researcher', label: '研究员' },
  { value: 'pm', label: '基金经理' },
  { value: 'leader', label: '研究所领导' },
  { value: 'admin', label: '管理员' },
];

export const UsersPage: React.FC = () => {
  return (
    <Layout role="admin">
      <PageHeader title="用户管理" subtitle="管理系统用户和权限" />
      <Card>
        <div className="mb-4 flex gap-4">
          <Input placeholder="搜索用户名/姓名" style={{ width: 200 }} />
          <Select placeholder="角色" options={roleOptions} value="all" style={{ width: 150 }} />
          <Button theme="primary" icon={<AddIcon />}>添加用户</Button>
        </div>
        <Table data={users} rowKey="id" columns={[
          { colKey: 'id', title: 'ID', width: 80 },
          { colKey: 'username', title: '用户名', width: 120 },
          { colKey: 'name', title: '姓名', width: 100 },
          {
            colKey: 'role',
            title: '角色',
            width: 120,
            cell: ({ row }) => {
              const colors: Record<string, string> = {
                '研究员': 'primary',
                '基金经理': 'warning',
                '研究所领导': 'danger',
                '管理员': 'default',
              };
              return <Tag color={colors[row.role] || 'default'}>{row.role}</Tag>;
            }
          },
          { colKey: 'team', title: '部门/团队', width: 120 },
          { colKey: 'email', title: '邮箱', width: 200 },
          {
            colKey: 'status',
            title: '状态',
            width: 100,
            cell: ({ row }) => (
              <Tag color={row.status === 'active' ? 'success' : 'danger'}>
                {row.status === 'active' ? '活跃' : '禁用'}
              </Tag>
            )
          },
          {
            colKey: 'action',
            title: '操作',
            width: 150,
            cell: () => (
              <div className="flex gap-2">
                <Button size="small" theme="primary">编辑</Button>
                <Button size="small" theme="danger">禁用</Button>
              </div>
            )
          },
        ]} />
      </Card>
    </Layout>
  );
};

export default UsersPage;