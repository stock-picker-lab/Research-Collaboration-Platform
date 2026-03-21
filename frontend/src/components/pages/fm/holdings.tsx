import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  TrendingDown,
  Eye,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

interface Holding {
  id: string;
  name: string;
  code: string;
  position: number;
  targetPosition: number;
  change24h: number;
  status: 'normal' | 'warning' | 'alert';
  lastUpdate: string;
  alerts: number;
}

const HoldingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('holdings');

  const holdings: Holding[] = [
    {
      id: '1',
      name: '贵州茅台',
      code: '600519.SH',
      position: 12.5,
      targetPosition: 15.0,
      change24h: -1.2,
      status: 'warning',
      lastUpdate: '2026-03-20',
      alerts: 2
    },
    {
      id: '2',
      name: '宁德时代',
      code: '300750.SZ',
      position: 10.8,
      targetPosition: 10.0,
      change24h: 2.5,
      status: 'normal',
      lastUpdate: '2026-03-20',
      alerts: 0
    },
    {
      id: '3',
      name: '比亚迪',
      code: '002594.SZ',
      position: 8.3,
      targetPosition: 8.0,
      change24h: 1.8,
      status: 'normal',
      lastUpdate: '2026-03-19',
      alerts: 0
    }
  ];

  const watchlist: Holding[] = [
    {
      id: '4',
      name: '五粮液',
      code: '000858.SZ',
      position: 0,
      targetPosition: 5.0,
      change24h: 0.8,
      status: 'normal',
      lastUpdate: '2026-03-20',
      alerts: 1
    },
    {
      id: '5',
      name: '泸州老窖',
      code: '000568.SZ',
      position: 0,
      targetPosition: 3.0,
      change24h: 1.5,
      status: 'normal',
      lastUpdate: '2026-03-19',
      alerts: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'alert': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'normal': return 'border-gray-200 bg-white';
      default: return 'border-gray-200 bg-white';
    }
  };

  const renderHoldingCard = (holding: Holding, isWatchlist: boolean = false) => (
    <Card key={holding.id} className={`border-2 ${getStatusColor(holding.status)} hover:shadow-lg transition-all`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">{holding.name}</h3>
            <p className="text-sm text-gray-600">{holding.code}</p>
          </div>
          {holding.alerts > 0 && (
            <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {holding.alerts}条提醒
            </Badge>
          )}
        </div>

        {!isWatchlist && (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">持仓比例</span>
                <span className="text-2xl font-bold text-gray-900">{holding.position}%</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="absolute top-0 left-0 h-3 bg-blue-600 rounded-full"
                  style={{ width: `${(holding.position / holding.targetPosition) * 100}%` }}
                />
                <div
                  className="absolute top-0 h-3 w-0.5 bg-gray-400"
                  style={{ left: `100%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>当前 {holding.position}%</span>
                <span>目标 {holding.targetPosition}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-b">
              <span className="text-sm text-gray-600">24h涨跌</span>
              <div className="flex items-center gap-1">
                {holding.change24h > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`font-semibold ${holding.change24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {holding.change24h > 0 ? '+' : ''}{holding.change24h}%
                </span>
              </div>
            </div>
          </>
        )}

        {isWatchlist && (
          <div className="mb-4">
            <div className="flex items-center justify-between py-3 border-t border-b">
              <span className="text-sm text-gray-600">24h涨跌</span>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">+{holding.change24h}%</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-sm text-gray-600">计划建仓比例:</span>
              <span className="text-lg font-bold text-blue-600 ml-2">{holding.targetPosition}%</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            查看详情
          </Button>
          {isWatchlist && (
            <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              建仓
            </Button>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          更新于 {holding.lastUpdate}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">持仓管理</h2>
            <p className="text-sm text-gray-600">
              管理投资组合,跟踪持仓标的和观察池
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            添加标的
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="holdings">
              持仓标的 ({holdings.length})
            </TabsTrigger>
            <TabsTrigger value="watchlist">
              观察池 ({watchlist.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <TabsContent value="holdings">
          <div className="grid grid-cols-3 gap-6">
            {holdings.map(holding => renderHoldingCard(holding, false))}
          </div>
        </TabsContent>

        <TabsContent value="watchlist">
          <div className="grid grid-cols-3 gap-6">
            {watchlist.map(holding => renderHoldingCard(holding, true))}
          </div>
        </TabsContent>
      </div>
    </div>
  );
};

export default HoldingsPage;