import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb,
  AlertCircle,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Edit,
  Eye,
  History,
  Send
} from 'lucide-react';

interface ConclusionLogic {
  id: string;
  title: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string[];
}

interface Assumption {
  id: string;
  title: string;
  status: 'verified' | 'pending' | 'broken';
  description: string;
  date: string;
}

interface ViewpointTimeline {
  id: string;
  date: string;
  type: 'rating' | 'target' | 'logic';
  title: string;
  content: string;
  author: string;
}

const ConclusionCardPage: React.FC = () => {
  const [coreLogics] = useState<ConclusionLogic[]>([
    {
      id: '1',
      title: '高端白酒需求韧性强,茅台品牌溢价持续',
      description: '茅台作为高端白酒龙头,品牌力极强,需求端韧性显著优于行业。批价稳定在2,600元以上,渠道利润充足,经销商推力强。',
      confidence: 'high',
      evidence: [
        'Q4批价稳定在2,600-2,700元区间',
        '经销商渠道利润率>30%',
        '消费者调研显示品牌首选度72%'
      ]
    },
    {
      id: '2',
      title: '直销占比提升至40%,渠道利润率改善',
      description: 'i茅台平台持续放量,直销占比从35%提升至40%,公司毛利率同比+2.1pct。渠道扁平化趋势明确。',
      confidence: 'high',
      evidence: [
        'Q4直销占比40%,同比+5pct',
        '毛利率92.1%,同比+2.1pct',
        'i茅台日活用户800万+'
      ]
    },
    {
      id: '3',
      title: '系列酒增速30%+,成为新增长极',
      description: '系列酒收入104.7亿元,同比+32.1%,增速显著高于茅台酒(12.8%)。公司加大系列酒推广力度,汉酱、赖茅等品牌表现亮眼。',
      confidence: 'medium',
      evidence: [
        'Q4系列酒收入104.7亿元,同比+32.1%',
        '汉酱/赖茅等单品增速40%+',
        '系列酒渠道数量+25%'
      ]
    }
  ]);

  const [assumptions] = useState<Assumption[]>([
    {
      id: '1',
      title: '2026年茅台酒出厂量增长8-10%',
      status: 'verified',
      description: '管理层指引2026年茅台酒产量增长8-10%,符合预期',
      date: '2026-03-15'
    },
    {
      id: '2',
      title: 'i茅台渠道占比提升至15%',
      status: 'pending',
      description: '公司计划2026年i茅台渠道占比从10%提升至15%',
      date: '2026-03-15'
    },
    {
      id: '3',
      title: '系列酒保持30%+增速',
      status: 'pending',
      description: '管理层目标系列酒收入300亿元,同比+30%',
      date: '2026-03-15'
    },
    {
      id: '4',
      title: '批价维持在2,800元以上',
      status: 'broken',
      description: '春节后批价回调至2,600元,低于预期',
      date: '2026-03-01'
    }
  ]);

  const [timeline] = useState<ViewpointTimeline[]>([
    {
      id: '1',
      date: '2026-03-15',
      type: 'rating',
      title: '维持"买入"评级',
      content: 'Q4财报超预期,营收+18%,净利润+22%,维持买入评级',
      author: '张研究员'
    },
    {
      id: '2',
      date: '2026-03-15',
      type: 'target',
      title: '目标价上调至¥2,280',
      content: '基于DCF估值,目标价从¥2,150上调至¥2,280,对应26年PE 30x',
      author: '张研究员'
    },
    {
      id: '3',
      date: '2026-03-10',
      type: 'logic',
      title: '新增核心逻辑:系列酒成为增长极',
      content: 'Q4系列酒增速32%,显著高于茅台酒,成为新增长驱动力',
      author: '张研究员'
    },
    {
      id: '4',
      date: '2026-03-01',
      type: 'logic',
      title: '下调批价假设',
      content: '春节后批价回调至2,600元,下调全年批价假设至2,650元',
      author: '张研究员'
    },
    {
      id: '5',
      date: '2026-02-15',
      type: 'rating',
      title: '首次覆盖,给予"买入"评级',
      content: '初始目标价¥2,150,看好高端白酒需求韧性和茅台品牌力',
      author: '张研究员'
    }
  ]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAssumptionIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'broken': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAssumptionColor = (status: string) => {
    switch (status) {
      case 'verified': return 'border-green-500 bg-green-50';
      case 'pending': return 'border-yellow-500 bg-yellow-50';
      case 'broken': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'rating': return <Target className="w-4 h-4" />;
      case 'target': return <TrendingUp className="w-4 h-4" />;
      case 'logic': return <Lightbulb className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'rating': return 'bg-blue-100 text-blue-700';
      case 'target': return 'bg-green-100 text-green-700';
      case 'logic': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧主要内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 标的信息 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  贵州茅台 (600519.SH)
                </h2>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-600 text-white px-3 py-1 text-base">
                    买入
                  </Badge>
                  <div className="text-sm text-gray-600">
                    更新于 2026-03-15
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">目标价</p>
                    <p className="text-2xl font-bold text-green-600">¥2,280</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">当前价</p>
                    <p className="text-2xl font-bold text-gray-900">¥1,850</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">空间</p>
                    <p className="text-2xl font-bold text-green-600">+23%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600 mb-1">行业</p>
                <p className="font-medium text-gray-900">白酒</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">市值</p>
                <p className="font-medium text-gray-900">2.32万亿</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">PE (TTM)</p>
                <p className="font-medium text-gray-900">28.5x</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">PB</p>
                <p className="font-medium text-gray-900">9.2x</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 核心逻辑 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900 text-lg">核心投资逻辑</h3>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                添加逻辑
              </Button>
            </div>

            <div className="space-y-4">
              {coreLogics.map((logic, index) => (
                <div key={logic.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="font-bold text-blue-600 text-lg">{index + 1}.</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{logic.title}</h4>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                          {logic.description}
                        </p>
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-2">支持证据:</p>
                          <ul className="space-y-1">
                            {logic.evidence.map((ev, idx) => (
                              <li key={idx} className="text-xs text-gray-600 flex gap-2">
                                <span className="text-green-600">✓</span>
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`text-xs ${getConfidenceColor(logic.confidence)}`}>
                        {logic.confidence === 'high' ? '高置信度' :
                         logic.confidence === 'medium' ? '中置信度' : '低置信度'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 风险提示 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900 text-lg">风险提示</h3>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                添加风险
              </Button>
            </div>

            <ul className="space-y-3">
              <li className="flex gap-3 p-3 bg-red-50 rounded-lg">
                <span className="text-red-600 font-bold text-lg">•</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">库存去化慢于预期</p>
                  <p className="text-sm text-gray-700">
                    春节旺季渠道库存去化速度慢于预期,批价从2,900元回调至2,600元,需持续跟踪渠道库存情况
                  </p>
                </div>
              </li>
              <li className="flex gap-3 p-3 bg-red-50 rounded-lg">
                <span className="text-red-600 font-bold text-lg">•</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">反腐政策持续影响商务消费</p>
                  <p className="text-sm text-gray-700">
                    政府持续推进反腐倡廉,商务消费需求可能受到一定影响
                  </p>
                </div>
              </li>
              <li className="flex gap-3 p-3 bg-red-50 rounded-lg">
                <span className="text-red-600 font-bold text-lg">•</span>
                <div>
                  <p className="font-medium text-gray-900 mb-1">直销占比提升挤压经销商利润</p>
                  <p className="text-sm text-gray-700">
                    i茅台直销渠道占比提升,可能挤压传统经销商利润空间,影响渠道稳定性
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 右侧假设管理和时间线 */}
      <div className="w-96 bg-white border-l overflow-y-auto">
        <Tabs defaultValue="assumptions" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-4">
            <TabsTrigger value="assumptions">假设管理</TabsTrigger>
            <TabsTrigger value="timeline">观点时间线</TabsTrigger>
          </TabsList>

          <TabsContent value="assumptions" className="flex-1 px-4 pb-4 mt-0">
            <div className="mb-4">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                添加假设
              </Button>
            </div>

            <div className="space-y-3">
              {['verified', 'pending', 'broken'].map(status => {
                const statusAssumptions = assumptions.filter(a => a.status === status);
                if (statusAssumptions.length === 0) return null;

                return (
                  <div key={status}>
                    <div className="flex items-center gap-2 mb-2">
                      {getAssumptionIcon(status)}
                      <h4 className="font-semibold text-sm text-gray-900">
                        {status === 'verified' ? '已验证' :
                         status === 'pending' ? '待验证' : '已打破'}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {statusAssumptions.length}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      {statusAssumptions.map(assumption => (
                        <Card key={assumption.id} className={`border-l-4 ${getAssumptionColor(assumption.status)}`}>
                          <CardContent className="p-3">
                            <h5 className="font-medium text-sm text-gray-900 mb-1">
                              {assumption.title}
                            </h5>
                            <p className="text-xs text-gray-600 leading-relaxed mb-2">
                              {assumption.description}
                            </p>
                            <p className="text-xs text-gray-500">{assumption.date}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="flex-1 px-4 pb-4 mt-0">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={item.id} className="relative pl-12">
                    <div className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${getTimelineColor(item.type)}`}>
                      {getTimelineIcon(item.type)}
                    </div>

                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.type === 'rating' ? '评级' :
                             item.type === 'target' ? '目标价' : '逻辑'}
                          </Badge>
                          <span className="text-xs text-gray-500">{item.date}</span>
                        </div>
                        <h5 className="font-medium text-sm text-gray-900 mb-1">
                          {item.title}
                        </h5>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">
                          {item.content}
                        </p>
                        <p className="text-xs text-gray-500">by {item.author}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4 mr-2" />
            推送给基金经理
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConclusionCardPage;
