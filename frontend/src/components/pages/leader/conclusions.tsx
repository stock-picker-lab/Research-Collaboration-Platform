/** 研究所领导 - 研报审核 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const ConclusionsPage: React.FC = () => (
  <Layout role="leader"><PageHeader title="研报审核" /><Card bordered><div style={{textAlign:'center',padding:40}}>审核列表</div></Card></Layout>
);
export default ConclusionsPage;