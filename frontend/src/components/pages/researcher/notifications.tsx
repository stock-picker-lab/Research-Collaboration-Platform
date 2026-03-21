import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell,
  AlertCircle,
  Info,
  CheckCircle,
  Settings,
  Filter,
  Clock,
  Mail,
  MessageSquare
} from 'lucide-react';

interface Notification {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  type: 'alert' | 'info' | 'task';
  title: string;
  content: string;
  company?: string;
  date: string;
  read: boolean;
}

const NotificationsPage: React.FC = () => {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      priority: 'P0',
      type: 'alert',
      title: '贵州茅台批价大幅回调',
      content: '批价从2,900元回调至2,600元,跌幅10.3%,建议立即跟进渠道情况',
      company: '贵州茅台',
      date: '2026-03-20 09:15',
      read: false
    },
    {
      id: '2',
      priority: 'P0',
      type: 'task',
      title: '李基金经理提问待答复',
      content: '茅台库存去化情况如何?请在今日18:00前答复',
      company: '贵州茅台',
      date: '2026-03-20 14:30',
      read: false
    },
    {
      id: '3',
      priority: 'P1',
      type: 'info',
      title: '五粮液发布Q4财报',
      content: 'Q4营收同比+15.2%,净利润+18.5%,符合预期',
      company: '五粮液',
      date: '2026-03-19 10:30',
      read: true
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-700 border-red-300';
      case 'P1': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'P2': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      case 'task': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">通知中心</h2>
              <p className="text-sm text-gray-600">
                {notifications.filter(n => !n.read).length} 条未读通知
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
              <Button variant="outline" size="sm">
                全部标为已读
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="P0">P0紧急</TabsTrigger>
              <TabsTrigger value="P1">P1重要</TabsTrigger>
              <TabsTrigger value="P2">P2一般</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-3">
            {notifications.map(notification => (
              <Card key={notification.id} className={!notification.read ? 'border-l-4 border-l-blue-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </Badge>
                          {notification.company && (
                            <Badge variant="outline" className="text-xs">
                              {notification.company}
                            </Badge>
                          )}
                          {!notification.read && (
                            <Badge className="bg-blue-600 text-white text-xs">未读</Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{notification.date}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{notification.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="w-96 bg-white border-l p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">推送设置</h3>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">推送渠道</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">站内通知</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">邮件推送</span>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">企业微信</span>
                  </div>
                  <input type="checkbox" className="rounded" />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">推送规则</h4>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">P0紧急通知</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <p className="text-xs text-gray-600">
                    批价异常波动、重大事件等
                  </p>
                </div>
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">P1重要通知</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <p className="text-xs text-gray-600">
                    财报发布、调研纪要等
                  </p>
                </div>
                <div>
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">P2一般通知</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                  <p className="text-xs text-gray-600">
                    行业资讯、研报发布等
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">免打扰时段</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">开始时间</label>
                  <input type="time" defaultValue="22:00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">结束时间</label>
                  <input type="time" defaultValue="08:00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700">P0紧急通知不受限制</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            保存设置
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;