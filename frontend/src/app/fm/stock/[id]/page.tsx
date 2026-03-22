/**
 * 基金经理 - 标的详情页
 * 路径: /fm/stock/:id
 * 功能: 查看标的公司详细信息、研究流时间线、风险变化面板
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button, Card, Badge, Tabs, Skeleton, MessagePlugin } from 'tdesign-react';
import { AddIcon, ErrorCircleIcon } from 'tdesign-icons-react';
import PageHeader from '@/components/common/PageHeader';
import AIAgentPanel from '@/components/AIAgentPanel';
import { getCompanyById } from '@/services/companyService';
import { getDocumentsByCompany } from '@/services/documentService';
import { getConclusionsByCompany } from '@/services/conclusionService';
import type { Company, Document, ConclusionCard } from '@/types';

const StockDetailPage: React.FC = () => {
  const params = useParams();
  const companyId = parseInt(params.id as string);
  
  const [company, setCompany] = useState<Company | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conclusions, setConclusions] = useState<ConclusionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [companyData, docsData, conclusionsData] = await Promise.all([
        getCompanyById(String(companyId)),
        getDocumentsByCompany(String(companyId)),
        getConclusionsByCompany(String(companyId))
      ]);
      setCompany(companyData);
      setDocuments(docsData);
      setConclusions(conclusionsData);
    } catch (error) {
      MessagePlugin.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = () => {
    // TODO: 打开提问表单
    MessagePlugin.info('提问功能开发中');
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton animation="gradient" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <ErrorCircleIcon size="48px" className="text-gray-400 mb-4" />
            <p className="text-gray-500">未找到公司信息</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题栏 */}
      <PageHeader
        title={company.name}
        subtitle={`${company.ticker}.${company.exchange} | ${company.industry}`}
      />
      <div className="flex gap-2 justify-end">
        <Button
          theme="primary"
          icon={<AddIcon />}
          onClick={handleAskQuestion}
        >
          发起提问
        </Button>
        <Button onClick={() => setShowAIPanel(!showAIPanel)}>
          AI分析
        </Button>
      </div>

      {/* 公司基本信息卡片 */}
      <Card>
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold">{company.name}</h3>
              <Badge theme="success" size="small">持仓中</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">代码:</span>
                <span className="ml-2 font-medium">{company.ticker}</span>
              </div>
              <div>
                <span className="text-gray-500">交易所:</span>
                <span className="ml-2 font-medium">{company.exchange}</span>
              </div>
              <div>
                <span className="text-gray-500">行业:</span>
                <span className="ml-2 font-medium">{company.industry}</span>
              </div>
              {company.sector && (
                <div>
                  <span className="text-gray-500">板块:</span>
                  <span className="ml-2 font-medium">{company.sector}</span>
                </div>
              )}
              {company.market_cap && (
                <div>
                  <span className="text-gray-500">市值:</span>
                  <span className="ml-2 font-medium">{company.market_cap}</span>
                </div>
              )}
            </div>
            {company.description && (
              <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                {company.description}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* AI助手面板 */}
      {showAIPanel && (
        <AIAgentPanel
          companyId={companyId}
          context="company"
        />
      )}

      {/* Tabs切换 */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(value: any) => setActiveTab(String(value))}
          placement="top"
        >
          <Tabs.TabPanel value="timeline" label="研究流时间线">
            <div className="py-6">
              <div className="space-y-4">
                {documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <div key={doc.id} className="flex gap-4 items-start">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {index < documents.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge theme="primary" size="small">{doc.doc_type}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium mb-1">{doc.title}</h4>
                        {doc.summary && (
                          <p className="text-sm text-gray-600 line-clamp-2">{doc.summary}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    暂无研究文档
                  </div>
                )}
              </div>
            </div>
          </Tabs.TabPanel>

          <Tabs.TabPanel value="risk" label="风险变化面板">
            <div className="py-6 space-y-4">
              {/* 风险项列表 */}
              <div className="space-y-3">
                <RiskItem
                  title="财务风险"
                  level="低"
                  description="公司财务状况良好,现金流充裕"
                  theme="success"
                />
                <RiskItem
                  title="市场风险"
                  level="中"
                  description="行业竞争加剧,市场份额面临挑战"
                  theme="warning"
                />
                <RiskItem
                  title="政策风险"
                  level="低"
                  description="行业政策环境稳定"
                  theme="success"
                />
                <RiskItem
                  title="运营风险"
                  level="低"
                  description="供应链管理完善,运营效率较高"
                  theme="success"
                />
              </div>
            </div>
          </Tabs.TabPanel>

          <Tabs.TabPanel value="conclusions" label="结论卡">
            <div className="py-6 space-y-3">
              {conclusions.length > 0 ? (
                conclusions.map((conclusion) => (
                  <Card key={conclusion.id} hover>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            theme={
                              conclusion.stance === 'bullish' ? 'success' :
                              conclusion.stance === 'bearish' ? 'danger' :
                              conclusion.stance === 'cautious' ? 'warning' : 'default'
                            }
                          >
                            {conclusion.stance}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(conclusion.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {conclusion.core_conclusions?.[0]?.text || '暂无核心逻辑'}
                        </p>
                      </div>
                      {conclusion.target_price && (
                        <div className="text-right ml-4">
                          <div className="text-xs text-gray-500">目标价</div>
                          <div className="text-lg font-bold text-blue-600">
                            {conclusion.target_price}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  暂无结论卡
                </div>
              )}
            </div>
          </Tabs.TabPanel>
        </Tabs>
      </Card>
    </div>
  );
};

// 风险项组件
interface RiskItemProps {
  title: string;
  level: string;
  description: string;
  theme: 'success' | 'warning' | 'danger';
}

const RiskItem: React.FC<RiskItemProps> = ({ title, level, description, theme }) => {
  return (
    <Card className="border-l-4" style={{ borderColor: theme === 'success' ? '#52c41a' : theme === 'warning' ? '#faad14' : '#f5222d' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{title}</h4>
            <Badge theme={theme} size="small">{level}</Badge>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default StockDetailPage;
