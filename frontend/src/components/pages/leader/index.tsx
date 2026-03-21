/** 研究所领导工作台 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { StatCard, PageHeader } from '@/components/common';

export const LeaderDashboard: React.FC = () => (
  <Layout role="leader">
    <PageHeader title="工作台" subtitle="研究所整体运营概览" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
      <StatCard title="研究员数量" value={10} color="primary" />
      <StatCard title="在研任务" value={25} color="warning" />
      <StatCard title="本月产出" value={18} color="success" />
      <StatCard title="待审核" value={5} color="danger" />
    </div>
  </Layout>
);
export default LeaderDashboard;