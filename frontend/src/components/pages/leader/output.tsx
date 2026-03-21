/** 研究所领导 - 产出统计 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const OutputPage: React.FC = () => (
  <Layout role="leader"><PageHeader title="产出统计" /><Card bordered><div style={{textAlign:'center',padding:40}}>统计数据</div></Card></Layout>
);
export default OutputPage;