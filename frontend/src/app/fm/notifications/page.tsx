/**
 * 基金经理 - 通知中心
 * 路径: /fm/notifications
 * 功能: 查看预警和通知信息
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Badge, Button, MessagePlugin, Loading } from 'tdesign-react';
import { NotificationIcon, CheckCircleIcon } from 'tdesign-icons-react';
import PageHeader from '@/components/common/PageHeader';
import { getAlerts, markAlertAsRead, markAllAlertsAsRead } from '@/services/alertService';
import type { Alert } from '@/types';

const NotificationsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts((data as any)?.items || (Array.isArray(data) ? data : []) as Alert[]);
    } catch (error) {
      MessagePlugin.error('加载通知失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAlertAsRead(id as any);
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: true } : a));
      MessagePlugin.success('已标记为已读');
    } catch (error) {
      MessagePlugin.error('操作失败');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAlertsAsRead();
      setAlerts(alerts.map(a => ({ ...a, is_read: true })));
      MessagePlugin.success('已全部标记为已读');
    } catch (error) {
      MessagePlugin.error('操作失败');
    }
  };

  const getFilteredAlerts = () => {
    switch (activeTab) {
      case 'unread':
        return alerts.filter(a => !a.is_read);
      case 'p0':
        return alerts.filter(a => a.severity === 'P0');
      case 'p1':
        return alerts.filter(a => a.severity === 'P1');
      case 'p2':
        return alerts.filter(a => a.severity === 'P2');
      default:
        return alerts;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const themes = {
      P0: 'danger',
      P1: 'warning',
      P2: 'default'
    };
    return themes[severity as keyof typeof themes] || 'default';
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;
  const filteredAlerts = getFilteredAlerts();

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题栏 */}
      <PageHeader
        title="通知中心"
        subtitle={`${unreadCount} 条未读通知`}
      />
      <div className="flex justify-end mb-4">
        <Button
          icon={<CheckCircleIcon />}
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
        >
          全部已读
        </Button>
      </div>

      {/* 通知列表 */}
      <Card>
        <Loading loading={loading} size="small">
          <Tabs
            value={activeTab}
            onChange={(value: any) => setActiveTab(String(value))}
            placement="top"
          >
            <Tabs.TabPanel value="all" label={`全部 (${alerts.length})`}>
              <AlertList
                alerts={filteredAlerts}
                onMarkAsRead={handleMarkAsRead}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel value="unread" label={`未读 (${unreadCount})`}>
              <AlertList
                alerts={filteredAlerts}
                onMarkAsRead={handleMarkAsRead}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel value="p0" label={`P0 紧急 (${alerts.filter(a => a.severity === 'P0').length})`}>
              <AlertList
                alerts={filteredAlerts}
                onMarkAsRead={handleMarkAsRead}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel value="p1" label={`P1 重要 (${alerts.filter(a => a.severity === 'P1').length})`}>
              <AlertList
                alerts={filteredAlerts}
                onMarkAsRead={handleMarkAsRead}
              />
            </Tabs.TabPanel>

            <Tabs.TabPanel value="p2" label={`P2 一般 (${alerts.filter(a => a.severity === 'P2').length})`}>
              <AlertList
                alerts={filteredAlerts}
                onMarkAsRead={handleMarkAsRead}
              />
            </Tabs.TabPanel>
          </Tabs>
        </Loading>
      </Card>
    </div>
  );
};

// 通知列表组件
interface AlertListProps {
  alerts: Alert[];
  onMarkAsRead: (id: string) => void;
}

const AlertList: React.FC<AlertListProps> = ({ alerts, onMarkAsRead }) => {
  const getSeverityBadge = (severity: string) => {
    const themes = {
      P0: 'danger',
      P1: 'warning',
      P2: 'default'
    };
    return themes[severity as keyof typeof themes] || 'default';
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <NotificationIcon size="48px" className="text-gray-300 mb-4" />
        <p className="text-gray-500">暂无通知</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-4">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          hover
          className={`transition-all ${!alert.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge theme={getSeverityBadge(alert.severity) as any}>
                  {alert.severity}
                </Badge>
                <Badge theme={alert.alert_type as any} variant="outline">
                  {alert.alert_type}
                </Badge>
                {!alert.is_read && (
                  <Badge theme="primary" size="small">未读</Badge>
                )}
                <span className="text-sm text-gray-500">
                  {new Date(alert.created_at).toLocaleString()}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{alert.title}</h4>
              <p className="text-sm text-gray-600">{alert.content}</p>
              {alert.company && (
                <div className="mt-2 text-xs text-gray-500">
                  相关公司: {alert.company.name} ({alert.company.ticker})
                </div>
              )}
            </div>
            {!alert.is_read && (
              <Button
                size="small"
                theme="default"
                onClick={() => onMarkAsRead(alert.id)}
              >
                标记已读
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NotificationsPage;
