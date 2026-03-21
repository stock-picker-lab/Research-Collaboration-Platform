/**
 * 研究员 - 我的预警页面
 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const AlertsPage: React.FC = () => {
  return (
    <Layout role="researcher">
      <PageHeader title="我的预警" subtitle="关注公司的最新动态预警" />
      <Card bordered>
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          预警列表
        </div>
      </Card>
    </Layout>
  );
};

export default AlertsPage;