"""
投研协作平台 - Pydantic 请求/响应模型
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, EmailStr


# ============================================
# 通用
# ============================================

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


class Citation(BaseModel):
    """证据引用"""
    document_id: str
    document_title: str
    chunk_id: Optional[str] = None
    page_number: Optional[int] = None
    paragraph: Optional[str] = None
    relevance_score: Optional[float] = None


class AIOutput(BaseModel):
    """AI 输出基础结构"""
    content: str
    confidence_level: str = "medium"  # high / medium / low
    citations: List[Citation] = []


# ============================================
# Auth
# ============================================

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    name: str
    role: str = "researcher"
    team: Optional[str] = None


# ============================================
# User
# ============================================

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    name: str
    role: str
    team: Optional[str] = None
    is_active: bool = True
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    team: Optional[str] = None
    coverage_scope: Optional[dict] = None
    push_preferences: Optional[dict] = None
    dashboard_config: Optional[dict] = None


# ============================================
# Company
# ============================================

class CompanyCreate(BaseModel):
    name: str
    ticker: str
    industry: Optional[str] = None
    sector: Optional[str] = None
    tags: Optional[List[str]] = None
    peer_list: Optional[List[str]] = None
    supply_chain_up: Optional[List[str]] = None
    supply_chain_down: Optional[List[str]] = None
    description: Optional[str] = None


class CompanyResponse(BaseModel):
    id: str
    name: str
    ticker: str
    industry: Optional[str] = None
    sector: Optional[str] = None
    tags: Optional[List[str]] = None
    peer_list: Optional[List[str]] = None
    supply_chain_up: Optional[List[str]] = None
    supply_chain_down: Optional[List[str]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    sector: Optional[str] = None
    tags: Optional[List[str]] = None
    peer_list: Optional[List[str]] = None
    supply_chain_up: Optional[List[str]] = None
    supply_chain_down: Optional[List[str]] = None
    description: Optional[str] = None


# ============================================
# Document
# ============================================

class DocumentCreate(BaseModel):
    title: str
    type: str
    source: Optional[str] = None
    company_id: Optional[str] = None
    related_company_ids: Optional[List[str]] = None
    publish_time: Optional[datetime] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class DocumentResponse(BaseModel):
    id: str
    title: str
    type: str
    source: Optional[str] = None
    company_id: Optional[str] = None
    publish_time: Optional[datetime] = None
    summary: Optional[dict] = None
    ai_analysis: Optional[dict] = None
    tags: Optional[List[str]] = None
    file_url: Optional[str] = None
    event_type: Optional[str] = None
    importance: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentAnalysisResponse(BaseModel):
    """文档解读结果"""
    document_id: str
    summary: AIOutput
    key_changes: List[AIOutput] = []
    above_expectations: List[AIOutput] = []
    below_expectations: List[AIOutput] = []
    risk_points: List[AIOutput] = []
    investment_impact: Optional[AIOutput] = None
    consistency_warnings: List[dict] = []


# ============================================
# ResearchTask
# ============================================

class TaskCreate(BaseModel):
    title: str
    type: str = "general"
    description: Optional[str] = None
    related_company_ids: Optional[List[str]] = None
    collaborator_ids: Optional[List[str]] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None
    template_id: Optional[str] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    type: str
    description: Optional[str] = None
    related_company_ids: Optional[List[str]] = None
    owner_id: str
    collaborator_ids: Optional[List[str]] = None
    priority: str
    status: str
    due_date: Optional[datetime] = None
    template_id: Optional[str] = None
    workflow_status: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    workflow_status: Optional[dict] = None


# ============================================
# ConclusionCard
# ============================================

class ConclusionCardCreate(BaseModel):
    company_id: str
    stance: str = "neutral"
    thesis: Optional[str] = None
    risks: Optional[str] = None
    key_metrics: Optional[dict] = None
    confidence_level: str = "medium"
    citations: Optional[List[dict]] = None
    change_reason: Optional[str] = None


class ConclusionCardResponse(BaseModel):
    id: str
    company_id: str
    author_id: str
    stance: str
    thesis: Optional[str] = None
    risks: Optional[str] = None
    key_metrics: Optional[dict] = None
    confidence_level: str
    citations: Optional[List[dict]] = None
    version: int
    is_latest: bool
    change_reason: Optional[str] = None
    assumptions: List["AssumptionResponse"] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ============================================
# Assumption
# ============================================

class AssumptionCreate(BaseModel):
    conclusion_card_id: str
    type: str
    description: str
    expected_value: Optional[str] = None
    validation_metrics: Optional[List[dict]] = None
    trigger_conditions: Optional[dict] = None


class AssumptionResponse(BaseModel):
    id: str
    conclusion_card_id: str
    type: str
    description: str
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    deviation_ratio: Optional[float] = None
    status: str
    auto_verified_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ============================================
# QuestionThread
# ============================================

class QuestionCreate(BaseModel):
    company_id: Optional[str] = None
    assignee_id: str
    question: str
    priority: str = "medium"
    parent_thread_id: Optional[str] = None


class QuestionResponse(BaseModel):
    id: str
    company_id: Optional[str] = None
    asker_id: str
    assignee_id: str
    question: str
    answer: Optional[str] = None
    answer_citations: Optional[List[dict]] = None
    status: str
    priority: str
    parent_thread_id: Optional[str] = None
    follow_up_thread_ids: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class QuestionAnswer(BaseModel):
    answer: str
    citations: Optional[List[dict]] = None


# ============================================
# Alert
# ============================================

class AlertResponse(BaseModel):
    id: str
    event_type: str
    severity: str
    related_company_ids: Optional[List[str]] = None
    title: str
    summary: Optional[str] = None
    source_document_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertDeliveryResponse(BaseModel):
    id: str
    alert_id: str
    user_id: str
    channel: str
    push_status: str
    sent_at: Optional[datetime] = None
    viewed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ============================================
# Template
# ============================================

class TemplateCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    sections: dict
    required_fields: Optional[List[str]] = None
    ai_tools_binding: Optional[dict] = None


class TemplateResponse(BaseModel):
    id: str
    name: str
    type: str
    description: Optional[str] = None
    sections: dict
    required_fields: Optional[List[str]] = None
    ai_tools_binding: Optional[dict] = None
    version: int
    is_system_default: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ============================================
# Copilot
# ============================================

class CopilotQuery(BaseModel):
    """Copilot 问答请求"""
    question: str
    conversation_id: Optional[str] = None
    company_id: Optional[str] = None
    document_ids: Optional[List[str]] = None
    context: Optional[dict] = None


class CopilotResponse(BaseModel):
    """Copilot 问答响应"""
    conversation_id: str
    answer: AIOutput
    related_documents: List[dict] = []
    suggested_follow_ups: List[str] = []


# ============================================
# Dashboard
# ============================================

class WorkbenchData(BaseModel):
    """研究员工作台数据"""
    todos: List[dict] = []
    coverage_pool: List[dict] = []
    recent_changes: List[dict] = []
    recent_context: List[dict] = []


class DashboardData(BaseModel):
    """基金经理驾驶舱数据"""
    key_changes: List[dict] = []
    portfolio_alerts: List[dict] = []
    summary_cards: List[dict] = []
    pending_questions: List[dict] = []


class ManagementStats(BaseModel):
    """管理层统计数据"""
    task_overview: dict = {}
    coverage_stats: dict = {}
    output_stats: dict = {}
    response_efficiency: dict = {}
    quality_metrics: dict = {}


# ============================================
# Peer Comparison
# ============================================

class PeerComparisonRequest(BaseModel):
    company_ids: List[str] = Field(..., min_length=2, max_length=10)
    metrics: Optional[List[str]] = None
    include_management_tone: bool = True


class PeerComparisonResponse(BaseModel):
    companies: List[dict]
    metric_comparison: List[dict] = []
    management_tone_comparison: Optional[List[dict]] = None
    auto_summary: Optional[AIOutput] = None
