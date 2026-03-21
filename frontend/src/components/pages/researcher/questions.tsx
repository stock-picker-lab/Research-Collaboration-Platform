/**
 * 研究员 - 问答协作页面
 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const QuestionsPage: React.FC = () => {
  return (
    <Layout role="researcher">
      <PageHeader title="问答协作" subtitle="与基金经理的问答互动" />
      <Card bordered>
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          问答列表
        </div>
      </Card>
    </Layout>
  );
};

export default QuestionsPage;