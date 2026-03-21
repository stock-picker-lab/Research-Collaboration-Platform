import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  Calendar,
  Filter,
  ChevronRight,
  Star,
  Target,
  Lightbulb
} from 'lucide-react';

interface Material {
  id: string;
  type: '财报' | '公告' | '研报' | '新闻' | '调研纪要';
  title: string;
  date: string;
  summary: string;
  importance: 'high' | 'medium' | 'low';
  tags: string[];
}

interface CompanyOverview {
  name: string;
  code: string;
  rating: string;
  targetPrice: string;
  currentPrice: string;
  coreLogic: string[];
  risks: string[];
}

const CompanyResearchPage: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['财报', '公告', '研报', '新闻', '调研纪要']);
  const [selectedCompany] = useState<CompanyOverview>({
    name: '贵州茅台',
    code: '600519.SH',
    rating: '买入',
    targetPrice: '2,280',
    currentPrice: '1,850',
    coreLogic: [
      '高端白酒需求韧性强,茅台品牌溢价持续',
      '直销占比提升至40%,渠道利润率改善',
      '系列酒增速30%+,成为新增长极'
    ],
    risks: [
      '库存去化慢于预期',
      '反腐政策持续影响商务消费'
    ]
  });

  const materials: Material[] = [
    {
      id: '1',
      type: '财报',
      title: '2025年Q4财报点评',
      date: '2026-03-15',
      summary: '营收同比+18%,净利润+22%,超市场预期。直销占比提升至40%,毛利率同比+2.1pct。',
      importance: 'high',
      tags: ['超预期', '毛利率提升']
    },
    {
      id: '2',
      type: '调研纪要',
      title: '管理层调研纪要',
      date: '2026-03-10',
      summary: '管理层表示2026年系列酒目标增长30%,i茅台渠道占比将提升至15%。',
      importance: 'high',
      tags: ['管理层指引', '渠道变革']
    },
    {
      id: '3',
      type: '研报',
      title: '申万宏源:高端白酒行业深度报告',
      date: '2026-03-08',
      summary: '高端白酒行业景气度持续,茅台、五粮液等龙头品牌市占率进一步提升。',
      importance: 'medium',
      tags: ['行业研究', '竞争格局']
    },
    {
      id: '4',
      type: '新闻',
      title: '茅台宣布新品i茅台2.0上线',
      date: '2026-03-05',
      summary: 'i茅台2.0新增会员积分体系,预约规则优化,有望进一步提升直销渗透率。',
      importance: 'medium',
      tags: ['新品发布', '数字化']
    },
    {
      id: '5',
      type: '公告',
      title: '关于变更注册资本的公告',
      date: '2026-03-01',
      summary: '公司注册资本由125.62亿元变更为125.69亿元。',
      importance: 'low',
      tags: ['注册资本']
    }
  ];

  const materialTypes = ['财报', '公告', '研报', '新闻', '调研纪要'];

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const filteredMaterials = materials.filter(m => selectedTypes.includes(m.type));

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '财报': return <TrendingUp className="w-4 h-4" />;
      case '公告': return <AlertCircle className="w-4 h-4" />;
      case '研报': return <FileText className="w-4 h-4" />;
      case '新闻': return <FileText className="w-4 h-4" />;
      case '调研纪要': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧筛选器 */}
      <div className="w-64 bg-white border-r p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">资料筛选</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">资料类型</p>
            <div className="space-y-2">
              {materialTypes.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">时间范围</p>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>最近1个月</option>
              <option>最近3个月</option>
              <option>最近半年</option>
              <option>最近1年</option>
              <option>全部</option>
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">重要性</p>
            <div className="space-y-2">
              {['高', '中', '低'].map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked />
                  <span className="text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 中间资料流 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedCompany.name} ({selectedCompany.code})
          </h2>
          <p className="text-sm text-gray-600">
            共 {filteredMaterials.length} 条资料
          </p>
        </div>

        <div className="space-y-4">
          {filteredMaterials.map(material => (
            <Card 
              key={material.id} 
              className={`border-l-4 hover:shadow-md transition-shadow cursor-pointer ${getImportanceColor(material.importance)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(material.type)}
                    <Badge variant="outline" className="text-xs">
                      {material.type}
                    </Badge>
                    {material.importance === 'high' && (
                      <Star className="w-4 h-4 text-red-500 fill-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {material.date}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                  {material.title}
                </h3>

                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {material.summary}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {material.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                    查看详情
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 右侧公司概览 */}
      <div className="w-80 bg-white border-l p-6 overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">公司概览</h3>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">投资评级</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 text-white px-3 py-1 text-base">
                  {selectedCompany.rating}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">目标价</p>
                <p className="text-xl font-bold text-green-600">
                  ¥{selectedCompany.targetPrice}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">当前价</p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{selectedCompany.currentPrice}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-1">上涨空间</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: '23%' }}
                  />
                </div>
                <span className="text-sm font-semibold text-green-600">+23%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-gray-900">核心逻辑</h4>
            </div>
            <ul className="space-y-2">
              {selectedCompany.coreLogic.map((logic, index) => (
                <li key={index} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>{logic}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-gray-900">风险提示</h4>
            </div>
            <ul className="space-y-2">
              {selectedCompany.risks.map((risk, index) => (
                <li key={index} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
          <Target className="w-4 h-4 mr-2" />
          更新结论卡
        </Button>
      </div>
    </div>
  );
};

export default CompanyResearchPage;
