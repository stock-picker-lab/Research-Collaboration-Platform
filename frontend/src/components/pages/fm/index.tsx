/**
 * 基金经理工作台
 */
'use client';
import React, { useState } from 'react';
import { Card, Tag } from 'tdesign-react';
import { FolderIcon, ChartBarIcon } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { StatCard, PageHeader } from '@/components/common';

export const FMDashboard: React.FC = () => {
  return (
    <Layout role="pm">
      <PageHeader title="工作台" subtitle="基金经理视角的投资研究平台" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        <StatCard title="持仓数量" value={15} icon={<FolderIcon />} color="primary" />
        <StatCard title="观察池" value={8} icon={<ChartBarIcon />} color="success" />
        <StatCard title="待回答问题" value={3} icon={<ChartBarIcon />} color="warning" />
        <StatCard title="新研报" value={12} icon={<ChartBarIcon />} color="danger" />
      </div>
    </Layout>
  );
};

export default FMDashboard;