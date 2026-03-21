/** 研究所领导 - 数据源管理 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const DatasourcePage: React.FC = () => (
  <Layout role="leader"><PageHeader title="数据源管理" /><Card bordered><div style={{textAlign:'center',padding:40}}>数据源列表</div></Card></Layout>
);
export default DatasourcePage;