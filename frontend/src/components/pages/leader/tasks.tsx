/** 研究所领导 - 任务管理 */
'use client';
import React from 'react';
import { Card } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const TasksPage: React.FC = () => (
  <Layout role="leader"><PageHeader title="任务管理" /><Card bordered><div style={{textAlign:'center',padding:40}}>任务列表</div></Card></Layout>
);
export default TasksPage;