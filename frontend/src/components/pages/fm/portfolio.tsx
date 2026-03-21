/** 基金经理 - 持仓管理 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const PortfolioPage: React.FC = () => (
  <Layout role="pm"><PageHeader title="持仓管理" /><Card bordered><div style={{textAlign:'center',padding:40}}>持仓列表</div></Card></Layout>
);
export default PortfolioPage;