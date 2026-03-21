/** 研究所领导 - 文档库 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const DocumentsPage: React.FC = () => (
  <Layout role="leader"><PageHeader title="文档库" /><Card bordered><div style={{textAlign:'center',padding:40}}>文档列表</div></Card></Layout>
);
export default DocumentsPage;