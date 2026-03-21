/**
 * 研究员 - 研报结论页面
 */
'use client';
import React from 'react';
import { Card, Tag } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader, StatusTag } from '@/components/common';

export const ConclusionsPage: React.FC = () => {
  return (
    <Layout role="researcher">
      <PageHeader title="研报结论" subtitle="查看和管理您的研究结论" />
      <Card bordered>
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          研报结论列表
        </div>
      </Card>
    </Layout>
  );
};

export default ConclusionsPage;