/** 基金经理 - 问答协作 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const QuestionsPage: React.FC = () => (
  <Layout role="pm"><PageHeader title="问答协作" /><Card bordered><div style={{textAlign:'center',padding:40}}>问答列表</div></Card></Layout>
);
export default QuestionsPage;