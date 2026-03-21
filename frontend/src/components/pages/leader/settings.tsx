/** 研究所领导 - 系统设置 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const SettingsPage: React.FC = () => (
  <Layout role="leader"><PageHeader title="系统设置" /><Card bordered><div style={{textAlign:'center',padding:40}}>设置面板</div></Card></Layout>
);
export default SettingsPage;