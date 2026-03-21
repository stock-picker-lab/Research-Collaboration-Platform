/** 系统管理员 - 审计日志 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const AuditPage: React.FC = () => (
  <Layout role="admin"><PageHeader title="审计日志" /><Card bordered><div style={{textAlign:'center',padding:40}}>日志列表</div></Card></Layout>
);
export default AuditPage;