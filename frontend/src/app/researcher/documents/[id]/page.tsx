'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIAgentPanel } from '@/components/AIAgentPanel';
import { 
  FileText, 
  Calendar, 
  User,
  Building2,
  Sparkles,
  Download,
  Share2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { agentService, type AnalyzeDocumentResponse } from '@/services/agentService';

interface Document {
  id: number;
  title: string;
  type: string;
  content: string;
  source: string;
  company_id?: number;
  company_name?: string;
  author?: string;
  published_date?: string;
  created_at: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = parseInt(params.id as string);
  
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDocumentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocumentData();
  }, [documentId]);

  const fetchDocumentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/documents/${documentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      }
    } catch (error) {
      console.error('Failed to fetch document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const result = await agentService.analyzeDocument({
        document_id: documentId,
        analysis_focus: ['valuation', 'growth', 'risk', 'competition']
      });
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'AI分析失败');
    } finally {
      setAnalyzing(false);
    }
  };

  const getStanceColor = (stance: string) => {
    switch (stance) {
      case 'bullish': return 'bg-green-100 text-green-800';
      case 'bearish': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (!document) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-700">文档不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 文档头部 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <Badge variant="outline">{document.type}</Badge>
                {document.company_name && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {document.company_name}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl mb-2">{document.title}</CardTitle>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {document.author && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {document.author}
                  </span>
                )}
                {document.published_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(document.published_date).toLocaleDateString('zh-CN')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                分享
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                下载
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI分析按钮 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-800">OpenClaw AI 智能分析</p>
                <p className="text-sm text-gray-600">
                  一键提取核心观点、投资评级、目标价、风险因素等结构化信息
                </p>
              </div>
            </div>
            <Button 
              onClick={handleAIAnalysis}
              disabled={analyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI 分析
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* AI分析结果 */}
      {analysisResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              AI 分析结果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 投资立场 */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">投资立场:</span>
              <Badge className={getStanceColor(analysisResult.investment_stance)}>
                {analysisResult.investment_stance.toUpperCase()}
              </Badge>
              {analysisResult.rating && (
                <Badge variant="outline">{analysisResult.rating}</Badge>
              )}
              {analysisResult.target_price && (
                <span className="text-sm">
                  目标价: <strong className="text-lg">¥{analysisResult.target_price}</strong>
                </span>
              )}
              <Badge variant="secondary">
                置信度: {analysisResult.analyst_confidence}
              </Badge>
            </div>

            {/* 核心摘要 */}
            <div>
              <p className="text-sm font-semibold mb-2">核心摘要:</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded">
                {analysisResult.summary}
              </p>
            </div>

            {/* 核心观点 */}
            {analysisResult.key_points.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">核心观点:</p>
                <ul className="space-y-1">
                  {analysisResult.key_points.map((point, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 风险因素 */}
            {analysisResult.risk_factors.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 text-orange-700">风险因素:</p>
                <ul className="space-y-1">
                  {analysisResult.risk_factors.map((risk, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-500">⚠️</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 催化剂 */}
            {analysisResult.catalysts.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 text-green-700">催化剂:</p>
                <ul className="space-y-1">
                  {analysisResult.catalysts.map((catalyst, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500">🚀</span>
                      {catalyst}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 标签 */}
            {analysisResult.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {analysisResult.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧:文档内容 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>文档内容</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {document.content}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧:AI Agent面板 */}
        <div className="lg:col-span-1">
          <AIAgentPanel 
            documentId={documentId}
            companyId={document.company_id}
            context="document"
          />
        </div>
      </div>
    </div>
  );
}
