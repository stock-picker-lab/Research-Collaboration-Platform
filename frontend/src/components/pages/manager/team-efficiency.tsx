import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  MessageSquare
} from 'lucide-react';

const TeamEfficiencyPage: React.FC = () => {
  const stats = [
    {
      title: '团队规模',
      value: '12',
      unit: '人',
      change: '+2',
      icon: <Users className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: '本月完成研究',
      value: '48',
      unit: '篇',
      change: '+12%',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: '平均响应时间',
      value: '4.2',
      unit: '小时',
      change: '-15%',
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow'
    },
    {
      title: '问答互动次数',
      value: '156',
      unit: '次',
      change: '+23%',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'purple'
    }
  ];

  const researchers = [
    { name: '张研究员', coverage: 12, reports: 8, questions: 15, efficiency: 92 },
    { name: '李研究员', coverage: 10, reports: 6, questions: 12, efficiency: 88 },
    { name: '王研究员', coverage: 8, reports: 5, questions: 10, efficiency: 85 }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
      green: { bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-700' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">团队效率看板</h2>
          <p className="text-sm text-gray-600">
            实时监控团队工作效率和产出质量
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
                    <div className={colors.text}>{stat.icon}</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                    <span className="text-sm text-gray-600">{stat.unit}</span>
                  </div>
                  <Badge className={colors.badge}>{stat.change}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 研究员效率排行 */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              研究员效率排行
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">研究员</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">覆盖标的</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">本月报告</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">问答次数</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">效率得分</th>
                  </tr>
                </thead>
                <tbody>
                  {researchers.map((researcher, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{researcher.name}</td>
                      <td className="px-4 py-4 text-center text-sm text-gray-700">{researcher.coverage}</td>
                      <td className="px-4 py-4 text-center text-sm text-gray-700">{researcher.reports}</td>
                      <td className="px-4 py-4 text-center text-sm text-gray-700">{researcher.questions}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${researcher.efficiency}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{researcher.efficiency}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamEfficiencyPage;