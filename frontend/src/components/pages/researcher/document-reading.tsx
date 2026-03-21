import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Bookmark,
  MessageSquare,
  Check,
  X,
  Download,
  Share2
} from 'lucide-react';

interface AIInsight {
  title: string;
  content: string[];
  confidence: 'high' | 'medium' | 'low';
}

const DocumentReadingPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['conclusions', 'metrics', 'risks']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const aiInsights = {
    conclusions: [
      {
        title: '营收超预期',
        content: [
          'Q4营收485亿元,同比+18%,超市场预期3%',
          '直销渠道占比提升至40%,同比+5pct',
          '系列酒收入同比+32%,成为增长主要驱动力'
        ],
        confidence: 'high' as const
      },
      {
        title: '盈利能力改善',
        content: [
          '毛利率92.1%,同比+2.1pct',
          '净利率53.2%,同比+1.8pct',
          '费用率控制良好,销售费用率下降0.5pct'
        ],
        confidence: 'high' as const
      }
    ],
    metrics: [
      {
        title: '关键指标变化',
        content: [
          '库存周转天数:45天→38天,去化加速',
          '应收账款周转天数:12天→10天,回款改善',
          'ROE:32.5%,同比+1.2pct',
          '经营性现金流:净利润比120%,质量优秀'
        ],
        confidence: 'high' as const
      },
      {
        title: '业务指引',
        content: [
          '2026年营收目标:1,500亿元(+15%)',
          '系列酒目标:300亿元(+30%)',
          'i茅台渠道占比目标:15%(当前10%)'
        ],
        confidence: 'medium' as const
      }
    ],
    risks: [
      {
        title: '短期风险',
        content: [
          '春节旺季库存去化慢于预期',
          '批价回调至2,600元,渠道利润收窄',
          '反腐政策持续,商务消费需求承压'
        ],
        confidence: 'high' as const
      },
      {
        title: '长期风险',
        content: [
          '直销占比提升挤压经销商利润,渠道稳定性待观察',
          '系列酒扩张可能稀释品牌溢价'
        ],
        confidence: 'medium' as const
      }
    ]
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high': return '高置信度';
      case 'medium': return '中置信度';
      case 'low': return '低置信度';
      default: return '未知';
    }
  };

  const renderInsightSection = (
    sectionKey: string,
    title: string,
    icon: React.ReactNode,
    insights: AIInsight[]
  ) => {
    const isExpanded = expandedSections.includes(sectionKey);

    return (
      <Card className="mb-4">
        <CardContent className="p-0">
          <button
            onClick={() => toggleSection(sectionKey)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {icon}
              <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
              <Badge variant="secondary" className="text-xs">
                {insights.length}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {isExpanded && (
            <div className="p-4 pt-0 space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <Badge className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
                      {getConfidenceText(insight.confidence)}
                    </Badge>
                  </div>
                  <ul className="space-y-2">
                    {insight.content.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Bookmark className="w-3 h-3 mr-1" />
                      标注
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      评论
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      确认
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-red-600">
                      <X className="w-3 h-3 mr-1" />
                      质疑
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧AI结构化摘要 */}
      <div className="w-[480px] bg-white border-r overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI结构化摘要
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline">贵州茅台</Badge>
              <span>•</span>
              <span>2025年Q4财报</span>
              <span>•</span>
              <span>2026-03-15</span>
            </div>
          </div>

          <Tabs defaultValue="ai" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai">AI摘要</TabsTrigger>
              <TabsTrigger value="manual">手动标注</TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="mt-4 space-y-0">
              {renderInsightSection(
                'conclusions',
                '核心结论',
                <Lightbulb className="w-5 h-5 text-yellow-600" />,
                aiInsights.conclusions
              )}

              {renderInsightSection(
                'metrics',
                '指标变化',
                <TrendingUp className="w-5 h-5 text-green-600" />,
                aiInsights.metrics
              )}

              {renderInsightSection(
                'risks',
                '风险提示',
                <AlertCircle className="w-5 h-5 text-red-600" />,
                aiInsights.risks
              )}
            </TabsContent>

            <TabsContent value="manual" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 text-center py-8">
                    暂无手动标注
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              生成结论卡
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 右侧PDF阅读器 */}
      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              贵州茅台酒股份有限公司2025年第四季度报告
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              共45页 • PDF格式 • 12.3 MB
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              下载
            </Button>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>100%</option>
              <option>125%</option>
              <option>150%</option>
              <option>200%</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-12">
            {/* PDF内容模拟 */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  贵州茅台酒股份有限公司
                </h1>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  2025年第四季度报告
                </h2>
                <p className="text-sm text-gray-600">
                  证券代码:600519 证券简称:贵州茅台
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  一、主要财务数据
                </h3>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    AI标注:营收超预期
                  </p>
                  <p className="text-xs text-blue-700">
                    置信度:高 • 标注于 2026-03-15 14:23
                  </p>
                </div>

                <table className="w-full border-collapse border border-gray-300 mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">项目</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">本期金额</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">上期金额</th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">增减比例</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-sm">营业收入</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-right">485.2亿元</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-right">411.0亿元</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-right text-green-600 font-semibold">+18.1%</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-sm">归母净利润</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-right">258.3亿元</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-right">211.5亿元</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-right text-green-600 font-semibold">+22.1%</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-sm">毛利率</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-right">92.1%</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-right">90.0%</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-right text-green-600 font-semibold">+2.1pct</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                  <p className="text-sm text-yellow-900 font-medium mb-1">
                    AI标注:关键指标
                  </p>
                  <p className="text-xs text-yellow-700">
                    置信度:中 • 标注于 2026-03-15 14:25
                  </p>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  报告期内,公司实现营业收入485.2亿元,同比增长18.1%,超市场预期3个百分点。
                  其中,茅台酒实现收入380.5亿元,同比增长12.8%;系列酒实现收入104.7亿元,
                  同比增长32.1%,系列酒成为公司新的增长极。
                </p>

                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  公司毛利率为92.1%,同比提升2.1个百分点,主要得益于直销渠道占比提升至40%,
                  同比提升5个百分点。净利率为53.2%,同比提升1.8个百分点,盈利能力持续改善。
                </p>

                <h3 className="text-lg font-bold text-gray-900 mb-4 mt-8">
                  二、业务经营情况
                </h3>

                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  报告期内,公司持续推进i茅台数字化营销平台建设,i茅台APP注册用户突破5,000万,
                  日活用户超过800万。i茅台渠道销售占比提升至10%,预计2026年将提升至15%。
                </p>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-sm text-red-900 font-medium mb-1">
                    AI标注:风险提示
                  </p>
                  <p className="text-xs text-red-700">
                    置信度:高 • 标注于 2026-03-15 14:27
                  </p>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  公司注意到,春节旺季期间渠道库存去化速度慢于预期,批价回调至2,600元左右,
                  较高点下降约300元。公司将密切关注渠道库存情况,适时调整发货节奏。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF页码导航 */}
        <div className="bg-white border-t p-4 flex items-center justify-center gap-4">
          <Button variant="outline" size="sm">上一页</Button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              defaultValue="1"
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
            />
            <span className="text-sm text-gray-600">/ 45</span>
          </div>
          <Button variant="outline" size="sm">下一页</Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentReadingPage;
