/**
 * 研究员 - 关注公司页面
 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const CompaniesPage: React.FC = () => {
  return (
    <Layout role="researcher">
      <PageHeader title="关注公司" subtitle="管理您关注的公司列表" />
      <Card bordered>
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          关注公司列表
        </div>
      </Card>
    </Layout>
  );
};

export default CompaniesPage;