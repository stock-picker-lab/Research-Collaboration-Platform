/**
 * 基金经理 - 情景推演
 * 路径: /fm/scenario
 * 功能: 通过调整参数进行组合影响推演,预测不同情景下的投资组合表现
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Slider, Loading, MessagePlugin, Table, Badge } from 'tdesign-react';
import { PlayCircleIcon, RefreshIcon } from 'tdesign-icons-react';
import PageHeader from '@/components/common/PageHeader';
import { getPortfolio } from '@/services/portfolioService';
import type { Portfolio } from '@/types';

interface ScenarioParams {
  raw_material_cost: number;  // 原材料成本变化
  demand_change: number;       // 需求变化
  exchange_rate: number;       // 汇率变化
  interest_rate: number;       // 利率变化
  market_sentiment: number;    // 市场情绪
}

interface ScenarioResult {
  company_id: number;
  company_name: string;
  ticker: string;
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  impact_percent: number;
  expected_change: string;
  recommendation: string;
}

const ScenarioPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [params, setParams] = useState<ScenarioParams>({
    raw_material_cost: 0,
    demand_change: 0,
    exchange_rate: 0,
    interest_rate: 0,
    market_sentiment: 50
  });
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const data = await getPortfolio();
      setPortfolios(data || []);
    } catch (error) {
      MessagePlugin.error('加载持仓数据失败');
    }
  };

  const runScenario = async () => {
    if (portfolios.length === 0) {
      MessagePlugin.warning('暂无持仓数据');
      return;
    }

    try {
      setLoading(true);
      // TODO: 调用真实的推演API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 模拟推演结果
      const mockResults: ScenarioResult[] = portfolios.map((p) => {
        // 简单的影响计算逻辑
        const costImpact = params.raw_material_cost * -0.3;
        const demandImpact = params.demand_change * 0.5;
        const rateImpact = params.exchange_rate * 0.2;
        const interestImpact = params.interest_rate * -0.4;
        const sentimentImpact = (params.market_sentiment - 50) * 0.1;

        const totalImpact = costImpact + demandImpact + rateImpact + interestImpact + sentimentImpact;
        
        return {
          company_id: p.company_id,
          company_name: p.company?.name || `公司${p.company_id}`,
          ticker: p.company?.ticker || '-',
          weight: p.weight || 0,
          impact: totalImpact > 2 ? 'positive' : totalImpact < -2 ? 'negative' : 'neutral',
          impact_percent: totalImpact,
          expected_change: totalImpact > 0 ? `+${totalImpact.toFixed(2)}%` : `${totalImpact.toFixed(2)}%`,
          recommendation: totalImpact > 5 ? '建议增持' : totalImpact < -5 ? '建议减持' : '建议持有'
        };
      });

      setResults(mockResults.sort((a, b) => b.impact_percent - a.impact_percent));
      setHasRun(true);
      MessagePlugin.success('推演完成');
    } catch (error) {
      MessagePlugin.error('推演失败');
    } finally {
      setLoading(false);
    }
  };

  const resetParams = () => {
    setParams({
      raw_material_cost: 0,
      demand_change: 0,
      exchange_rate: 0,
      interest_rate: 0,
      market_sentiment: 50
    });
    setHasRun(false);
    setResults([]);
  };

  const columns = [
    {
      colKey: 'company_name',
      title: '公司名称',
      width: 200,
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.company_name}</div>
          <div className="text-xs text-gray-500">{row.ticker}</div>
        </div>
      )
    },
    {
      colKey: 'weight',
      title: '持仓权重',
      width: 100,
      cell: ({ row }: any) => `${(row.weight * 100).toFixed(2)}%`
    },
    {
      colKey: 'impact',
      title: '影响方向',
      width: 100,
      cell: ({ row }: any) => (
        <Badge
          theme={row.impact === 'positive' ? 'success' : row.impact === 'negative' ? 'danger' : 'default'}
        >
          {row.impact === 'positive' ? '正面' : row.impact === 'negative' ? '负面' : '中性'}
        </Badge>
      )
    },
    {
      colKey: 'expected_change',
      title: '预期变化',
      width: 120,
      cell: ({ row }: any) => (
        <span className={`font-bold ${
          row.impact === 'positive' ? 'text-green-600' : row.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {row.expected_change}
        </span>
      )
    },
    {
      colKey: 'recommendation',
      title: '操作建议',
      width: 120
    }
  ];

  const portfolioValue = results.reduce((sum, r) => sum + r.impact_percent * r.weight, 0);

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题栏 */}
      <PageHeader
        title="情景推演"
        subtitle="调整参数进行组合影响推演,预测不同情景下的投资表现"
      />

      <div className="grid grid-cols-3 gap-6">
        {/* 左侧: 参数配置区 */}
        <div className="col-span-1 space-y-4">
          <Card title="情景参数配置" className="h-full">
            <div className="space-y-6">
              {/* 原材料成本 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">原材料成本变化</span>
                  <span className="text-sm text-gray-600">
                    {params.raw_material_cost > 0 ? '+' : ''}{params.raw_material_cost}%
                  </span>
                </div>
                <Slider
                  value={params.raw_material_cost}
                  onChange={(value) => setParams({ ...params, raw_material_cost: value as number })}
                  min={-50}
                  max={50}
                  step={1}
                  marks={{ '-50': '-50%', '0': '0%', '50': '+50%' }}
                />
              </div>

              {/* 需求变化 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">市场需求变化</span>
                  <span className="text-sm text-gray-600">
                    {params.demand_change > 0 ? '+' : ''}{params.demand_change}%
                  </span>
                </div>
                <Slider
                  value={params.demand_change}
                  onChange={(value) => setParams({ ...params, demand_change: value as number })}
                  min={-50}
                  max={50}
                  step={1}
                  marks={{ '-50': '-50%', '0': '0%', '50': '+50%' }}
                />
              </div>

              {/* 汇率变化 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">汇率变化</span>
                  <span className="text-sm text-gray-600">
                    {params.exchange_rate > 0 ? '+' : ''}{params.exchange_rate}%
                  </span>
                </div>
                <Slider
                  value={params.exchange_rate}
                  onChange={(value) => setParams({ ...params, exchange_rate: value as number })}
                  min={-20}
                  max={20}
                  step={1}
                  marks={{ '-20': '-20%', '0': '0%', '20': '+20%' }}
                />
              </div>

              {/* 利率变化 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">利率变化</span>
                  <span className="text-sm text-gray-600">
                    {params.interest_rate > 0 ? '+' : ''}{params.interest_rate}%
                  </span>
                </div>
                <Slider
                  value={params.interest_rate}
                  onChange={(value) => setParams({ ...params, interest_rate: value as number })}
                  min={-10}
                  max={10}
                  step={0.5}
                  marks={{ '-10': '-10%', '0': '0%', '10': '+10%' }}
                />
              </div>

              {/* 市场情绪 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">市场情绪</span>
                  <span className="text-sm text-gray-600">
                    {params.market_sentiment}/100
                  </span>
                </div>
                <Slider
                  value={params.market_sentiment}
                  onChange={(value) => setParams({ ...params, market_sentiment: value as number })}
                  min={0}
                  max={100}
                  step={5}
                  marks={{ '0': '极度悲观', '50': '中性', '100': '极度乐观' }}
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 pt-4">
                <Button
                  theme="primary"
                  block
                  icon={<PlayCircleIcon />}
                  onClick={runScenario}
                  loading={loading}
                >
                  运行推演
                </Button>
                <Button
                  theme="default"
                  icon={<RefreshIcon />}
                  onClick={resetParams}
                >
                  重置
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧: 推演结果区 */}
        <div className="col-span-2 space-y-4">
          {hasRun ? (
            <Loading loading={loading} size="small">
              {/* 总体影响 */}
              <Card>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">组合整体预期变化</div>
                  <div className={`text-4xl font-bold ${
                    portfolioValue > 0 ? 'text-green-600' : portfolioValue < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {portfolioValue > 0 ? '+' : ''}{portfolioValue.toFixed(2)}%
                  </div>
                </div>
              </Card>

              {/* 详细结果表格 */}
              <Card title="推演结果详情">
                <Table
                  data={results}
                  columns={columns}
                  rowKey="company_id"
                  bordered
                  hover
                  size="small"
                  maxHeight={500}
                  empty="暂无数据"
                />
              </Card>

              {/* 推演说明 */}
              <Card className="bg-blue-50">
                <h4 className="font-bold text-blue-900 mb-2">📌 推演说明</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 本推演基于历史数据和统计模型,仅供参考</li>
                  <li>• 实际影响会受到多种因素影响,存在不确定性</li>
                  <li>• 建议结合研究员的深度分析进行决策</li>
                </ul>
              </Card>
            </Loading>
          ) : (
            <Card>
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🔮</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">情景推演</h3>
                <p className="text-gray-500">调整左侧参数后,点击"运行推演"查看结果</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioPage;
