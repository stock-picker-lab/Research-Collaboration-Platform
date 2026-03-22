'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AIAgentPanel } from '@/components/AIAgentPanel';
import { 
  Building2, 
  TrendingUp, 
  FileText, 
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Company {
  id: number;
  name: string;
  code: string;
  industry: string;
  sector: string;
  market_cap?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = parseInt(params.id as string);
  
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/companies/${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-700">公司不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 公司基本信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">{company.name}</CardTitle>
                <p className="text-gray-500 mt-1">
                  {company.code} | {company.industry}
                </p>
              </div>
            </div>
            <Badge 
              variant={company.status === 'active' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {company.status === 'active' ? '正在跟踪' : '已归档'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">行业</p>
                <p className="font-medium">{company.industry}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">市值</p>
                <p className="font-medium">
                  {company.market_cap ? `${(company.market_cap / 1e8).toFixed(2)}亿` : '未知'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">创建时间</p>
                <p className="font-medium">
                  {new Date(company.created_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">板块</p>
                <p className="font-medium">{company.sector || '未分类'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主内容区 - 左侧Tab + 右侧AI Agent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧:公司详情Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="documents">研报文档</TabsTrigger>
              <TabsTrigger value="financials">财务数据</TabsTrigger>
              <TabsTrigger value="events">重要事件</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>公司简介</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {company.name} ({company.code}) 是一家位于{company.industry}行业的上市公司。
                    目前状态: {company.status === 'active' ? '正在跟踪' : '已归档'}。
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 提示: 使用右侧的 <strong>AI Agent 助手</strong> 快速分析该公司的投资价值、风险因素等!
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>基本面指标</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">市盈率(PE)</p>
                      <p className="text-lg font-semibold">--</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">市净率(PB)</p>
                      <p className="text-lg font-semibold">--</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">ROE</p>
                      <p className="text-lg font-semibold">--</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">净利润增长率</p>
                      <p className="text-lg font-semibold">--</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    * 数据功能开发中,即将上线
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>相关研报</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">研报列表功能开发中...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financials">
              <Card>
                <CardHeader>
                  <CardTitle>财务报表</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">财务数据功能开发中...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>重要事件</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">事件时间线功能开发中...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 右侧:AI Agent面板 */}
        <div className="lg:col-span-1">
          <AIAgentPanel 
            companyId={companyId}
            context="company"
          />
        </div>
      </div>
    </div>
  );
}
