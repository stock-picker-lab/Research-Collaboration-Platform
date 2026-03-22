/**
 * OpenClaw Agent 服务客户端
 * 封装与后端 Agent API 的交互
 */

import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AnalyzeDocumentRequest {
  document_id: number;
  analysis_focus?: string[];
}

export interface AnalyzeDocumentResponse {
  task_id: string;
  summary: string;
  investment_stance: string;
  rating?: string;
  target_price?: number;
  key_points: string[];
  financial_highlights: Record<string, any>;
  risk_factors: string[];
  catalysts: string[];
  analyst_confidence: string;
  tags: string[];
}

export interface AskQuestionRequest {
  question: string;
  company_id?: number;
  doc_types?: string[];
}

export interface AskQuestionResponse {
  question: string;
  answer: string;
  sources: Array<{
    doc_index: number;
    relevance: string;
    key_info: string;
  }>;
  confidence: string;
  follow_up_questions: string[];
  retrieved_docs_count: number;
}

export interface RiskMonitorRequest {
  company_id: number;
  risk_types?: string[];
  time_window_days?: number;
}

export interface RiskMonitorResponse {
  overall_risk_level: string;
  risk_alerts: Array<{
    risk_type: string;
    severity: string;
    title: string;
    description: string;
    evidence: string;
    potential_impact: string;
    recommended_action: string;
  }>;
  positive_signals: string[];
  monitoring_suggestions: string[];
  summary: string;
}

export interface GenerateInsightRequest {
  company_id: number;
  insight_type?: string;
}

export interface HealthCheckResponse {
  status: string;
  openclaw_status: string;
  message?: string;
}

class AgentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 检查 Agent 服务健康状态
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await axios.get(`${API_BASE}/api/v1/agents/health`);
    return response.data;
  }

  /**
   * 分析研报文档
   */
  async analyzeDocument(
    request: AnalyzeDocumentRequest
  ): Promise<AnalyzeDocumentResponse> {
    const response = await axios.post(
      `${API_BASE}/api/v1/agents/analyze-document`,
      request,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * 智能问答
   */
  async askQuestion(
    request: AskQuestionRequest
  ): Promise<AskQuestionResponse> {
    const response = await axios.post(
      `${API_BASE}/api/v1/agents/ask`,
      request,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * 风险监控
   */
  async monitorRisk(
    request: RiskMonitorRequest
  ): Promise<RiskMonitorResponse> {
    const response = await axios.post(
      `${API_BASE}/api/v1/agents/risk-monitor`,
      request,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * 生成投资洞察
   */
  async generateInsight(
    request: GenerateInsightRequest
  ): Promise<any> {
    const response = await axios.post(
      `${API_BASE}/api/v1/agents/generate-insight`,
      request,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  /**
   * 查询任务状态
   */
  async getTaskStatus(taskId: string): Promise<any> {
    const response = await axios.get(
      `${API_BASE}/api/v1/agents/tasks/${taskId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
}

export const agentService = new AgentService();
