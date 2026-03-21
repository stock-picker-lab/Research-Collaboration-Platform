/** 基金经理 - 研报结论 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const ConclusionsPage: React.FC = () => (
  <Layout role="pm"><PageHeader title="研报结论" /><Card bordered><div style={{textAlign:'center',padding:40}}>研报列表</div></Card></Layout>
);
export default ConclusionsPage;