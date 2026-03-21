/** 基金经理 - 观察池 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const WatchlistPage: React.FC = () => (
  <Layout role="pm"><PageHeader title="观察池" /><Card bordered><div style={{textAlign:'center',padding:40}}>观察池列表</div></Card></Layout>
);
export default WatchlistPage;