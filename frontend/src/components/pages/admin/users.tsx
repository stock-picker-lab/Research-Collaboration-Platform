/** 系统管理员 - 用户管理 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const UsersPage: React.FC = () => (
  <Layout role="admin"><PageHeader title="用户管理" /><Card bordered><div style={{textAlign:'center',padding:40}}>用户列表</div></Card></Layout>
);
export default UsersPage;