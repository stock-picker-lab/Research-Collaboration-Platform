/** 研究所领导 - 团队管理 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const TeamPage: React.FC = () => (
  <Layout role="leader"><PageHeader title="团队管理" /><Card bordered><div style={{textAlign:'center',padding:40}}>团队列表</div></Card></Layout>
);
export default TeamPage;