import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Target
} from 'lucide-react';

interface SummarySection {
  title: string;
  items: string[];
  icon: React.ReactNode;
  color: string;
}

const SummaryCardPage: React.FC = () => {
  const summaryData = {
    coreConclusions: [
      'Q4营收+18%,净利润+22%,超市场预期。直销占比提升至40%,毛利率同比+2.1pct',
      '系列酒收入+32%,成为新增长极。汉酱、赖茅等单品增速40%+',
      '批价从2,900元回调至2,600元,主要是季节性因素,预计Q2企稳回升'
    ],
    keyChanges: [
      '库存周转天数从45天降至38天,去化加速',
      'i茅台日活用户突破800万,数字化转型提速',
      '经营性现金流/净利润达120%,现金流质量优秀'
    ],
    risks: [
      '春节后库存去化慢于预期,需持续跟踪渠道动态',
      '直销占比提升挤压经销商利润,渠道稳定性待观察'
    ],
    suggestedQuestions: [
      '系列酒30%+增速是否可持续?公司的资源投入如何?'
    ]
  };

  const sections: SummarySection[] = [
    {
      title: '核心结论',
      items: summaryData.coreConclusions,
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: '关键变化',
      items: summaryData.keyChanges,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: '风险点',
      items: summaryData.risks,
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'red'
    },
    {
      title: '建议关注问题',
      items: summaryData.suggestedQuestions,
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-500',
        icon: 'text-green-600',
        badge: 'bg-green-100 text-green-700'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-500',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-700'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-500',
        icon: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-700'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        {/* 头部 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">贵州茅台</h2>
                  <Badge variant="outline">600519.SH</Badge>
                  <Badge className="bg-green-600 text-white">买入</Badge>
                </div>
                <p className="text-sm text-gray-600">2025年Q4财报点评 • 更新于 2026-03-15</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">目标价</p>
                    <p className="text-xl font-bold text-green-600">¥2,280</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">当前价</p>
                    <p className="text-xl font-bold text-gray-900">¥1,850</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">空间</p>
                    <p className="text-xl font-bold text-green-600">+23%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>研究员:张研究员</span>
              <span>•</span>
              <span>覆盖行业:白酒</span>
            </div>
          </CardContent>
        </Card>

        {/* 3-3-2-1 结构化摘要 */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const colors = getColorClasses(section.color);
            const count = section.items.length;
            
            return (
              <Card key={index} className={`border-l-4 ${colors.border}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <div className={colors.icon}>{section.icon}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{section.title}</h3>
                      <Badge className={colors.badge}>{count}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {section.items.map((item, idx) => (
                      <div key={idx} className={`p-4 rounded-lg ${colors.bg}`}>
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full ${colors.badge} flex items-center justify-center font-semibold text-sm`}>
                            {idx + 1}
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed flex-1">{item}</p>
                        </div>
                        <div className="flex gap-2 mt-3 ml-9">
                          <Button variant="ghost" size="sm" className="text-xs">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            查看证据
                          </Button>
                          {section.title === '建议关注问题' && (
                            <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              发起提问
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 mt-6">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg">
            <MessageSquare className="w-5 h-5 mr-2" />
            向研究员提问
          </Button>
          <Button variant="outline" size="lg" className="flex-1">
            <Target className="w-5 h-5 mr-2" />
            加入观察池
          </Button>
        </div>

        {/* 相关资料 */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">支持证据</h3>
            <div className="space-y-3">
              {[
                { title: '2025年Q4财报', date: '2026-03-15', type: '财报' },
                { title: '管理层调研纪要', date: '2026-03-10', type: '调研' },
                { title: '渠道跟踪数据', date: '2026-03-08', type: '数据' }
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                    <span className="text-sm font-medium text-gray-900">{doc.title}</span>
                    <span className="text-xs text-gray-500">{doc.date}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SummaryCardPage;