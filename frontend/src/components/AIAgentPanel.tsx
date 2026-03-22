/**
 * AI Agent 面板组件
 * 提供 OpenClaw Agent 功能的交互界面
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { agentService, type AskQuestionResponse, type RiskMonitorResponse } from '@/services/agentService';

interface AIAgentPanelProps {
  companyId?: number;
  companyName?: string;
  documentId?: number;
  context?: 'document' | 'company' | 'general';
  onClose?: () => void;
}

export function AIAgentPanel({ companyId, companyName, documentId, context = 'general', onClose }: AIAgentPanelProps) {
  const [activeTab, setActiveTab] = useState<'qa' | 'risk' | 'analyze' | 'insight'>('qa');
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [qaResult, setQaResult] = useState<AskQuestionResponse | null>(null);
  const [riskResult, setRiskResult] = useState<RiskMonitorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 智能问答
  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await agentService.askQuestion({
        question,
        company_id: companyId,
        doc_types: ['research_report', 'financial_statement']
      });
      setQaResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || '问答失败');
    } finally {
      setLoading(false);
    }
  };

  // 风险监控
  const handleRiskMonitor = async () => {
    if (!companyId) {
      setError('请先选择公司');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await agentService.monitorRisk({
        company_id: companyId,
        risk_types: ['financial', 'operational', 'market', 'regulatory'],
        time_window_days: 30
      });
      setRiskResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || '风险监控失败');
    } finally {
      setLoading(false);
    }
  };

  // 文档分析
  const handleAnalyzeDocument = async () => {
    if (!documentId) {
      setError('请先选择文档');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await agentService.analyzeDocument({
        document_id: documentId,
        analysis_focus: ['valuation', 'growth', 'risk']
      });
      window.alert('分析完成:\n' + JSON.stringify(result, null, 2));
    } catch (err: any) {
      setError(err.response?.data?.detail || '文档分析失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成洞察
  const handleGenerateInsight = async () => {
    if (!companyId) {
      setError('请先选择公司');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await agentService.generateInsight({
        company_id: companyId,
        insight_type: 'comprehensive'
      });
      window.alert('洞察生成完成:\n' + JSON.stringify(result, null, 2));
    } catch (err: any) {
      setError(err.response?.data?.detail || '洞察生成失败');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          AI Agent 助手
          <Badge variant="secondary" className="ml-2">OpenClaw</Badge>
          {onClose && (
            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab 切换 */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={activeTab === 'qa' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('qa')}
          >
            💬 智能问答
          </Button>
          {companyId && (
            <>
              <Button
                variant={activeTab === 'risk' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('risk')}
              >
                ⚠️ 风险监控
              </Button>
              <Button
                variant={activeTab === 'insight' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('insight')}
              >
                💡 投资洞察
              </Button>
            </>
          )}
          {documentId && (
            <Button
              variant={activeTab === 'analyze' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('analyze')}
            >
              🔍 文档分析
            </Button>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 智能问答 Tab */}
        {activeTab === 'qa' && (
          <div className="space-y-4">
            <Textarea
              placeholder="请输入你的问题(例如: 这家公司的盈利能力如何?)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <Button 
              onClick={handleAskQuestion} 
              disabled={loading || !question.trim()}
              className="w-full"
            >
              {loading ? '⏳ 分析中...' : '提问'}
            </Button>

            {qaResult && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="font-semibold">AI 回答</span>
                  <Badge variant="outline">{qaResult.confidence}</Badge>
                </div>
                <p className="text-sm leading-relaxed">{qaResult.answer}</p>
                
                {qaResult.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">信息来源:</p>
                    {qaResult.sources.map((source, idx) => (
                      <div key={idx} className="text-xs text-gray-600 ml-4">
                        • 文档 {source.doc_index} ({source.relevance})
                      </div>
                    ))}
                  </div>
                )}

                {qaResult.follow_up_questions.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">建议追问:</p>
                    {qaResult.follow_up_questions.map((q, idx) => (
                      <Button
                        key={idx}
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto block"
                        onClick={() => setQuestion(q)}
                      >
                        • {q}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 风险监控 Tab */}
        {activeTab === 'risk' && companyId && (
          <div className="space-y-4">
            <Button 
              onClick={handleRiskMonitor} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '⏳ 分析中...' : '执行风险监控'}
            </Button>

            {riskResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">整体风险等级</span>
                  <Badge className={getRiskLevelColor(riskResult.overall_risk_level)}>
                    {riskResult.overall_risk_level.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600">{riskResult.summary}</p>

                {riskResult.risk_alerts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">风险预警:</p>
                    {riskResult.risk_alerts.map((riskAlert, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {riskAlert.risk_type}
                          </Badge>
                          <Badge className={getRiskLevelColor(riskAlert.severity)}>
                            {riskAlert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold">{riskAlert.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{riskAlert.description}</p>
                        {riskAlert.recommended_action && (
                          <p className="text-xs text-blue-600 mt-2">
                            💡 建议: {riskAlert.recommended_action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {riskResult.positive_signals.length > 0 && (
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-sm font-semibold mb-2">积极信号:</p>
                    {riskResult.positive_signals.map((signal, idx) => (
                      <p key={idx} className="text-xs text-gray-600">✓ {signal}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 文档分析 Tab */}
        {activeTab === 'analyze' && documentId && (
          <div className="space-y-4">
            <Button 
              onClick={handleAnalyzeDocument} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '⏳ 分析中...' : '分析文档'}
            </Button>
          </div>
        )}

        {/* 投资洞察 Tab */}
        {activeTab === 'insight' && companyId && (
          <div className="space-y-4">
            <Button 
              onClick={handleGenerateInsight} 
              disabled={loading}
              className="w-full"
            >
              {loading ? '⏳ 生成中...' : '生成投资洞察'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 支持默认导入
export default AIAgentPanel;
