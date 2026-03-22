/**
 * 基金经理 - 组合影响评估
 * 路径: /fm/impact
 * 功能: 评估突发事件对持仓组合的影响程度,热力图可视化
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Loading, MessagePlugin, Tag } from 'tdesign-react';
import { RefreshIcon } from 'tdesign-icons-react';
import PageHeader from '@/components/common/PageHeader';
import { getPortfolio } from '@/services/portfolioService';
import type { Portfolio } from '@/types';

interface Event {
  id: number;
  title: string;
  type: string;
  date: string;
}

interface ImpactData {
  company_id: number;
  company_name: string;
  ticker: string;
  weight: number;
  impact_level: 'high' | 'medium' | 'low' | 'neutral';
  impact_score: number;
  description: string;
}

const ImpactAssessPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [impactData, setImpactData] = useState<ImpactData[]>([]);
  const [loading, setLoading] = useState(false);

  // 模拟事件数据
  const events: Event[] = [
    { id: 1, title: '美联储加息50个基点', type: '宏观政策', date: '2026-03-20' },
    { id: 2, title: '原油价格暴涨20%', type: '大宗商品', date: '2026-03-18' },
    { id: 3, title: '新能源车补贴政策调整', type: '行业政策', date: '2026-03-15' },
    { id: 4, title: '半导体出口管制升级', type: '政策监管', date: '2026-03-10' },
    { id: 5, title: '消费需求超预期', type: '市场需求', date: '2026-03-05' }
  ];

  useEffect(() => {
    fetchPortfolio();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      assessImpact();
    }
  }, [selectedEvent]);

  const fetchPortfolio = async () => {
    try {
      const data = await getPortfolio();
      setPortfolios(data || []);
    } catch (error) {
      MessagePlugin.error('加载持仓数据失败');
    }
  };

  const assessImpact = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      // TODO: 调用真实的影响评估API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟影响评估数据
      const mockData: ImpactData[] = portfolios.map((p, index) => {
        const impactLevels: Array<'high' | 'medium' | 'low' | 'neutral'> = ['high', 'medium', 'low', 'neutral'];
        const level = impactLevels[index % 4];
        const scores = { high: 85, medium: 60, low: 35, neutral: 10 };
        
        return {
          company_id: p.company_id,
          company_name: p.company?.name || `公司${p.company_id}`,
          ticker: p.company?.ticker || '-',
          weight: p.weight || 0,
          impact_level: level,
          impact_score: scores[level] + Math.random() * 10,
          description: getImpactDescription(level)
        };
      });

      setImpactData(mockData.sort((a, b) => b.impact_score - a.impact_score));
    } catch (error) {
      MessagePlugin.error('评估失败');
    } finally {
      setLoading(false);
    }
  };

  const getImpactDescription = (level: string): string => {
    const descriptions = {
      high: '重大影响,建议立即采取行动',
      medium: '中等影响,建议持续关注',
      low: '轻微影响,无需特别关注',
      neutral: '影响极小或中性'
    };
    return descriptions[level as keyof typeof descriptions] || '';
  };

  const getImpactColor = (level: string): string => {
    const colors = {
      high: '#f5222d',
      medium: '#faad14',
      low: '#52c41a',
      neutral: '#d9d9d9'
    };
    return colors[level as keyof typeof colors] || '#d9d9d9';
  };

  const getImpactBgColor = (level: string): string => {
    const colors = {
      high: 'bg-red-100',
      medium: 'bg-yellow-100',
      low: 'bg-green-100',
      neutral: 'bg-gray-100'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100';
  };

  const eventOptions = events.map(e => ({
    label: `${e.title} (${e.type})`,
    value: e.id
  }));

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题栏 */}
      <PageHeader
        title="组合影响评估"
        subtitle="评估突发事件对持仓组合的影响程度"
      />

      {/* 事件选择器 */}
      <Card>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            选择事件:
          </label>
          <Select
            value={selectedEvent}
            onChange={(value) => setSelectedEvent(value as number)}
            options={eventOptions}
            placeholder="请选择事件"
            className="flex-1 max-w-md"
          />
          <Button
            icon={<RefreshIcon />}
            onClick={assessImpact}
            disabled={!selectedEvent}
          >
            重新评估
          </Button>
        </div>
      </Card>

      {/* 影响评估结果 */}
      {selectedEvent && (
        <Loading loading={loading} size="small">
          <div className="space-y-4">
            {/* 总体影响统计 */}
            <Card>
              <h3 className="text-lg font-bold mb-4">总体影响统计</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {impactData.filter(d => d.impact_level === 'high').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">重大影响</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {impactData.filter(d => d.impact_level === 'medium').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">中等影响</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {impactData.filter(d => d.impact_level === 'low').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">轻微影响</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">
                    {impactData.filter(d => d.impact_level === 'neutral').length}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">中性</div>
                </div>
              </div>
            </Card>

            {/* 热力图 */}
            <Card>
              <h3 className="text-lg font-bold mb-4">持仓标的影响热力图</h3>
              <div className="space-y-2">
                {impactData.map((item) => (
                  <div
                    key={item.company_id}
                    className={`p-4 rounded-lg transition-all hover:shadow-md ${getImpactBgColor(item.impact_level)}`}
                    style={{
                      borderLeft: `4px solid ${getImpactColor(item.impact_level)}`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900">
                            {item.company_name} ({item.ticker})
                          </h4>
                          <Tag theme={item.impact_level === 'high' ? 'danger' : item.impact_level === 'medium' ? 'warning' : 'success'} size="small">
                            {item.impact_level === 'high' ? '重大影响' : item.impact_level === 'medium' ? '中等影响' : item.impact_level === 'low' ? '轻微影响' : '中性'}
                          </Tag>
                          <span className="text-sm text-gray-500">
                            持仓权重: {(item.weight * 100).toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <div className="text-right ml-6">
                        <div className="text-3xl font-bold" style={{ color: getImpactColor(item.impact_level) }}>
                          {item.impact_score.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">影响分数</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 建议操作 */}
            <Card className="bg-blue-50">
              <h3 className="text-lg font-bold mb-4 text-blue-900">💡 建议操作</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {impactData.filter(d => d.impact_level === 'high').length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>对重大影响标的,建议立即评估是否需要调整持仓</span>
                  </li>
                )}
                {impactData.filter(d => d.impact_level === 'medium').length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    <span>对中等影响标的,建议加强监控,密切关注后续发展</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>可向研究员发起针对性提问,获取更多信息</span>
                </li>
              </ul>
            </Card>
          </div>
        </Loading>
      )}

      {/* 提示信息 */}
      {!selectedEvent && (
        <Card>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500">请选择事件开始评估</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImpactAssessPage;
