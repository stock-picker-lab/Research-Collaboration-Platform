import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  Plus,
  X,
  Search,
  Sparkles,
  Download
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  code: string;
}

interface ComparisonData {
  metric: string;
  category: string;
  companies: {
    [key: string]: {
      value: string;
      trend?: 'up' | 'down' | 'flat';
      comparison: 'best' | 'good' | 'average' | 'poor';
    };
  };
}

const PeerComparisonPage: React.FC = () => {
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([
    { id: '1', name: '贵州茅台', code: '600519.SH' },
    { id: '2', name: '五粮液', code: '000858.SZ' },
    { id: '3', name: '泸州老窖', code: '000568.SZ' },
    { id: '4', name: '洋河股份', code: '002304.SZ' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const availableCompanies: Company[] = [
    { id: '5', name: '山西汾酒', code: '600809.SH' },
    { id: '6', name: '古井贡酒', code: '000596.SZ' },
    { id: '7', name: '今世缘', code: '603369.SH' },
    { id: '8', name: '水井坊', code: '600779.SH' }
  ];

  const comparisonData: ComparisonData[] = [
    {
      metric: '营收增长率(%)',
      category: '成长性',
      companies: {
        '600519.SH': { value: '18.1', trend: 'up', comparison: 'best' },
        '000858.SZ': { value: '15.2', trend: 'up', comparison: 'good' },
        '000568.SZ': { value: '22.5', trend: 'up', comparison: 'best' },
        '002304.SZ': { value: '12.8', trend: 'up', comparison: 'average' }
      }
    },
    {
      metric: '净利润增长率(%)',
      category: '成长性',
      companies: {
        '600519.SH': { value: '22.1', trend: 'up', comparison: 'best' },
        '000858.SZ': { value: '18.5', trend: 'up', comparison: 'good' },
        '000568.SZ': { value: '25.3', trend: 'up', comparison: 'best' },
        '002304.SZ': { value: '14.2', trend: 'up', comparison: 'average' }
      }
    },
    {
      metric: '毛利率(%)',
      category: '盈利能力',
      companies: {
        '600519.SH': { value: '92.1', trend: 'up', comparison: 'best' },
        '000858.SZ': { value: '75.8', trend: 'flat', comparison: 'good' },
        '000568.SZ': { value: '78.2', trend: 'up', comparison: 'good' },
        '002304.SZ': { value: '72.5', trend: 'down', comparison: 'average' }
      }
    },
    {
      metric: 'ROE(%)',
      category: '盈利能力',
      companies: {
        '600519.SH': { value: '32.5', trend: 'up', comparison: 'best' },
        '000858.SZ': { value: '25.3', trend: 'flat', comparison: 'good' },
        '000568.SZ': { value: '28.1', trend: 'up', comparison: 'good' },
        '002304.SZ': { value: '22.8', trend: 'down', comparison: 'average' }
      }
    },
    {
      metric: '净利率(%)',
      category: '盈利能力',
      companies: {
        '600519.SH': { value: '53.2', trend: 'up', comparison: 'best' },
        '000858.SZ': { value: '38.5', trend: 'flat', comparison: 'good' },
        '000568.SZ': { value: '42.1', trend: 'up', comparison: 'good' },
        '002304.SZ': { value: '35.8', trend: 'down', comparison: 'average' }
      }
    },
    {
      metric: '库存周转天数(天)',
      category: '运营效率',
      companies: {
        '600519.SH': { value: '38', trend: 'down', comparison: 'best' },
        '000858.SZ': { value: '85', trend: 'up', comparison: 'poor' },
        '000568.SZ': { value: '65', trend: 'flat', comparison: 'average' },
        '002304.SZ': { value: '120', trend: 'up', comparison: 'poor' }
      }
    },
    {
      metric: '应收账款周转天数(天)',
      category: '运营效率',
      companies: {
        '600519.SH': { value: '10', trend: 'down', comparison: 'best' },
        '000858.SZ': { value: '15', trend: 'flat', comparison: 'good' },
        '000568.SZ': { value: '18', trend: 'up', comparison: 'average' },
        '002304.SZ': { value: '25', trend: 'up', comparison: 'poor' }
      }
    },
    {
      metric: '资产负债率(%)',
      category: '偿债能力',
      companies: {
        '600519.SH': { value: '22.5', trend: 'down', comparison: 'best' },
        '000858.SZ': { value: '28.3', trend: 'flat', comparison: 'good' },
        '000568.SZ': { value: '32.8', trend: 'up', comparison: 'average' },
        '002304.SZ': { value: '45.2', trend: 'up', comparison: 'poor' }
      }
    },
    {
      metric: '经营现金流/净利润(%)',
      category: '现金流',
      companies: {
        '600519.SH': { value: '120', trend: 'up', comparison: 'best' },
        '000858.SZ': { value: '95', trend: 'flat', comparison: 'good' },
        '000568.SZ': { value: '105', trend: 'up', comparison: 'good' },
        '002304.SZ': { value: '85', trend: 'down', comparison: 'average' }
      }
    }
  ];

  const getComparisonColor = (comparison: string) => {
    switch (comparison) {
      case 'best': return 'bg-green-100 text-green-800 font-semibold';
      case 'good': return 'bg-green-50 text-green-700';
      case 'average': return 'bg-gray-100 text-gray-700';
      case 'poor': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
      case 'flat': return <Minus className="w-3 h-3 text-gray-600" />;
      default: return null;
    }
  };

  const removeCompany = (id: string) => {
    if (selectedCompanies.length <= 2) {
      alert('至少需要保留2家公司进行对比');
      return;
    }
    setSelectedCompanies(prev => prev.filter(c => c.id !== id));
  };

  const addCompany = (company: Company) => {
    if (selectedCompanies.length >= 5) {
      alert('最多只能对比5家公司');
      return;
    }
    setSelectedCompanies(prev => [...prev, company]);
    setShowAddDialog(false);
    setSearchQuery('');
  };

  const categories = Array.from(new Set(comparisonData.map(d => d.category)));

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* 头部 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">同行对比分析</h2>
          <p className="text-sm text-gray-600">
            对比高端白酒行业主要标的的财务指标和运营效率
          </p>
        </div>

        {/* 同行池选择 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">同行池</h3>
              <div className="text-sm text-gray-600">
                {selectedCompanies.length}/5
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              {selectedCompanies.map(company => (
                <div
                  key={company.id}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{company.name}</p>
                    <p className="text-xs text-gray-600">{company.code}</p>
                  </div>
                  {selectedCompanies.length > 2 && (
                    <button
                      onClick={() => removeCompany(company.id)}
                      className="ml-2 p-1 hover:bg-blue-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              ))}

              {selectedCompanies.length < 5 && (
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">添加公司</span>
                </button>
              )}
            </div>

            {showAddDialog && (
              <div className="border-t pt-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索公司名称或代码..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {availableCompanies
                    .filter(c =>
                      !selectedCompanies.find(sc => sc.id === c.id) &&
                      (c.name.includes(searchQuery) || c.code.includes(searchQuery))
                    )
                    .map(company => (
                      <button
                        key={company.id}
                        onClick={() => addCompany(company)}
                        className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
                      >
                        <div className="text-left">
                          <p className="font-medium text-gray-900 text-sm">{company.name}</p>
                          <p className="text-xs text-gray-600">{company.code}</p>
                        </div>
                        <Plus className="w-4 h-4 text-blue-600" />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI对比摘要 */}
        <Card className="mb-6 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">AI对比摘要</h3>
              <Badge className="bg-purple-100 text-purple-800 text-xs">智能分析</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">综合评价</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-semibold text-green-700">贵州茅台</span>在盈利能力和运营效率方面表现最优,
                  毛利率高达92.1%,ROE达到32.5%,库存周转天数仅38天,显著优于同行。
                  <span className="font-semibold text-green-700">泸州老窖</span>在成长性方面表现突出,
                  营收和净利润增速均超过20%。
                  <span className="font-semibold text-yellow-700">洋河股份</span>库存周转压力较大,
                  需关注渠道去化情况。
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">核心差异</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-700 flex gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>品牌溢价:</strong> 茅台毛利率92.1%,显著高于五粮液(75.8%)和泸州老窖(78.2%)</span>
                  </li>
                  <li className="text-sm text-gray-700 flex gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>库存管理:</strong> 茅台库存周转38天,洋河股份120天,差异明显</span>
                  </li>
                  <li className="text-sm text-gray-700 flex gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>现金流质量:</strong> 茅台经营现金流/净利润达120%,现金流质量最优</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">投资建议</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  建议超配<span className="font-semibold text-green-700">贵州茅台</span>和
                  <span className="font-semibold text-green-700">泸州老窖</span>,
                  两者在品牌力、盈利能力和成长性方面均表现优异。
                  <span className="font-semibold text-yellow-700">洋河股份</span>需等待库存去化拐点。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 对比矩阵 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">指标对比矩阵</h3>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出Excel
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50 sticky left-0 z-10">
                      指标
                    </th>
                    {selectedCompanies.map(company => (
                      <th
                        key={company.id}
                        className="px-4 py-3 text-center text-sm font-semibold text-gray-900 bg-gray-50"
                      >
                        <div>{company.name}</div>
                        <div className="text-xs font-normal text-gray-600 mt-1">
                          {company.code}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <React.Fragment key={category}>
                      <tr className="bg-blue-50">
                        <td
                          colSpan={selectedCompanies.length + 1}
                          className="px-4 py-2 text-sm font-semibold text-blue-900"
                        >
                          {category}
                        </td>
                      </tr>
                      {comparisonData
                        .filter(d => d.category === category)
                        .map((data, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 bg-white sticky left-0 z-10">
                              {data.metric}
                            </td>
                            {selectedCompanies.map(company => {
                              const cellData = data.companies[company.code];
                              return (
                                <td
                                  key={company.id}
                                  className={`px-4 py-3 text-center ${getComparisonColor(cellData.comparison)}`}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-medium">{cellData.value}</span>
                                    {getTrendIcon(cellData.trend)}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>行业领先</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 rounded"></div>
                <span>表现良好</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>行业平均</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded"></div>
                <span>低于预期</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PeerComparisonPage;
