'use client';
import React from 'react';
import { Card, Switch, Button } from 'tdesign-react';
import { Layout } from '@/components/layout';
import { PageHeader } from '@/components/common';

export const SettingsPage: React.FC = () => {
  return (
    <Layout role="admin">
      <PageHeader title="系统设置" subtitle="平台全局配置" />
      <div className="space-y-4">
        <Card title="通知设置">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">启用邮件通知</span>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">启用站内通知</span>
              <Switch defaultValue />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">启用 SMS 通知</span>
              <Switch />
            </div>
            <Button theme="primary">保存</Button>
          </div>
        </Card>

        <Card title="预警规则">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">P0 预警通知</span>
              <Switch defaultValue />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">P1 预警通知</span>
              <Switch defaultValue />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">P2 预警通知</span>
              <Switch />
            </div>
            <Button theme="primary">保存</Button>
          </div>
        </Card>

        <Card title="Agent 配置">
          <div className="space-y-4 text-gray-600">
            <p>Supervisor Agent 系统提示词配置</p>
            <p>Document Analysis Agent 系统提示词配置</p>
            <Button theme="primary">保存配置</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;