"""
Agent API 路由
与 OpenClaw 集成的 AI Agent 功能接口
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from pydantic import BaseModel, Field

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.models.document import Document
from app.models.company import Company
from app.services.agent_service import agent_service
from app.agents.openclaw_client import openclaw_client

router = APIRouter()


# ==================== Request/Response Models ====================

class AnalyzeDocumentRequest(BaseModel):
    document_id: int = Field(..., description="文档ID")
    analysis_focus: Optional[List[str]] = Field(
        default=["valuation", "growth", "risk"],
        description="分析重点领域"
    )


class AnalyzeDocumentResponse(BaseModel):
    task_id: str
    summary: str
    investment_stance: str
    rating: Optional[str]
    target_price: Optional[float]
    key_points: List[str]
    financial_highlights: dict
    risk_factors: List[str]
    catalysts: List[str]
    analyst_confidence: str
    tags: List[str]


class AskQuestionRequest(BaseModel):
    question: str = Field(..., min_length=5, max_length=500)
    company_id: Optional[int] = Field(None, description="限定公司范围")
    doc_types: Optional[List[str]] = Field(
        default=["research_report", "financial_statement"],
        description="文档类型过滤"
    )


class AskQuestionResponse(BaseModel):
    question: str
    answer: str
    sources: List[dict]
    confidence: str
    follow_up_questions: List[str]
    retrieved_docs_count: int


class RiskMonitorRequest(BaseModel):
    company_id: int = Field(..., description="公司ID")
    risk_types: Optional[List[str]] = Field(
        default=["financial", "operational", "market"],
        description="监控的风险类型"
    )
    time_window_days: int = Field(default=30, ge=1, le=180)


class RiskMonitorResponse(BaseModel):
    overall_risk_level: str
    risk_alerts: List[dict]
    positive_signals: List[str]
    monitoring_suggestions: List[str]
    summary: str


class GenerateInsightRequest(BaseModel):
    company_id: int
    insight_type: str = Field(
        default="comprehensive",
        description="洞察类型: comprehensive/trend/opportunity/risk"
    )


class HealthCheckResponse(BaseModel):
    status: str
    openclaw_status: str
    message: Optional[str]


# ==================== API Endpoints ====================

@router.get("/health", response_model=HealthCheckResponse)
async def agent_health_check():
    """检查 OpenClaw Agent 服务健康状态"""
    try:
        is_healthy = await openclaw_client.health_check()
        return {
            "status": "healthy" if is_healthy else "unhealthy",
            "openclaw_status": "connected" if is_healthy else "disconnected",
            "message": "OpenClaw Gateway is running" if is_healthy else "Cannot connect to OpenClaw"
        }
    except Exception as e:
        return {
            "status": "error",
            "openclaw_status": "unknown",
            "message": str(e)
        }


@router.post("/analyze-document", response_model=AnalyzeDocumentResponse)
async def analyze_document(
    request: AnalyzeDocumentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    分析研报文档
    
    使用 OpenClaw 的 research-document-analyzer 技能
    提取核心观点、投资评级、目标价等信息
    """
    # 1. 查询文档
    document = await db.get(Document, request.document_id)
    if not document:
        raise HTTPException(status_code=404, detail="文档不存在")
    
    # 2. 查询关联公司
    company = None
    if document.company_id:
        company = await db.get(Company, document.company_id)
    
    # 3. 权限检查(简化版,实际应根据业务需求)
    # if document.visibility == "private" and document.created_by != current_user.id:
    #     raise HTTPException(status_code=403, detail="无权访问此文档")
    
    # 4. 调用 Agent 服务
    try:
        result = await agent_service.analyze_document(
            document=document,
            company=company,
            analysis_focus=request.analysis_focus
        )
        
        # 5. 保存分析结果到数据库(可选,这里简化处理)
        # TODO: 将 result 保存到 document_analyses 表
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"文档分析失败: {str(e)}"
        )


@router.post("/ask", response_model=AskQuestionResponse)
async def ask_question(
    request: AskQuestionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    智能问答接口
    
    基于 RAG 检索相关文档,使用 OpenClaw 生成专业回答
    """
    # 1. 验证公司是否存在(如果指定了company_id)
    company = None
    if request.company_id:
        company = await db.get(Company, request.company_id)
        if not company:
            raise HTTPException(status_code=404, detail="公司不存在")
    
    # 2. 检索相关文档(这里简化,实际应调用向量检索服务)
    # TODO: 实现真正的向量检索
    relevant_docs = []  # 占位符
    
    # 3. 调用 Agent 服务
    try:
        result = await agent_service.answer_question(
            question=request.question,
            company=company,
            relevant_docs=relevant_docs,
            doc_types=request.doc_types
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"问答处理失败: {str(e)}"
        )


@router.post("/risk-monitor", response_model=RiskMonitorResponse)
async def monitor_risk(
    request: RiskMonitorRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    风险监控接口
    
    分析公司最近的风险因素,生成预警和建议
    """
    # 1. 查询公司
    company = await db.get(Company, request.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="公司不存在")
    
    # 2. 权限检查(分析师+以上可用)
    if current_user.role not in ["analyst", "researcher", "admin"]:
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 3. 调用 Agent 服务
    try:
        result = await agent_service.generate_risk_alert(
            company=company,
            risk_types=request.risk_types,
            time_window_days=request.time_window_days
        )
        
        # 4. 如果风险等级为 high/critical,发送后台通知(可选)
        if result.get("overall_risk_level") in ["high", "critical"]:
            background_tasks.add_task(
                send_risk_notification,
                company_id=company.id,
                risk_level=result["overall_risk_level"],
                user_id=current_user.id
            )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"风险监控失败: {str(e)}"
        )


@router.post("/generate-insight")
async def generate_investment_insight(
    request: GenerateInsightRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    生成投资洞察
    
    基于公司历史数据、研报、财务数据等生成综合投资洞察
    """
    # 1. 查询公司
    company = await db.get(Company, request.company_id)
    if not company:
        raise HTTPException(status_code=404, detail="公司不存在")
    
    # 2. 权限检查
    if current_user.role not in ["analyst", "researcher", "admin"]:
        raise HTTPException(status_code=403, detail="权限不足")
    
    # 3. 调用 Agent 服务
    try:
        result = await agent_service.generate_insight(
            company=company,
            insight_type=request.insight_type
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"洞察生成失败: {str(e)}"
        )


@router.get("/tasks/{task_id}")
async def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    查询 OpenClaw 任务状态
    
    用于轮询长时间运行的任务
    """
    try:
        # 调用 OpenClaw 客户端查询任务
        status = await openclaw_client.get_task_status(task_id)
        return status
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"任务查询失败: {str(e)}"
        )


# ==================== Helper Functions ====================

async def send_risk_notification(company_id: int, risk_level: str, user_id: int):
    """发送风险预警通知(后台任务)"""
    # TODO: 实现通知逻辑(邮件/站内信/Webhook)
    print(f"[后台任务] 发送风险预警: 公司ID={company_id}, 风险等级={risk_level}, 用户ID={user_id}")
