"""
投研协作平台 - Copilot 问答 API & 预警 API & 仪表板 API
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional, List
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.security import get_current_user, allow_all, allow_pm, allow_leader
from app.services.copilot_service import CopilotService
from app.services.alert_service import AlertService
from app.models.models import (
    ResearchTask, Document, ConclusionCard, QuestionThread,
    Alert, AlertDelivery, User, TaskStatus, QuestionStatus,
)
from app.schemas import CopilotQuery, CopilotResponse, PaginatedResponse

# ============================================
# Copilot 问答
# ============================================

copilot_router = APIRouter(prefix="/copilot", tags=["Copilot 问答"])


@copilot_router.post("/ask", response_model=dict)
async def copilot_ask(
    data: CopilotQuery,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """研究问答"""
    result = await CopilotService.ask(
        db=db,
        user_id=current_user["user_id"],
        question=data.question,
        conversation_id=data.conversation_id,
        company_id=data.company_id,
        document_ids=data.document_ids,
    )
    return result


@copilot_router.get("/conversations", response_model=PaginatedResponse)
async def list_conversations(
    company_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """获取对话历史"""
    conversations, total = await CopilotService.get_conversations(
        db, current_user["user_id"], company_id, page, page_size
    )
    return PaginatedResponse(
        items=[{
            "id": c.id,
            "title": c.title,
            "company_id": c.company_id,
            "message_count": len(c.messages) if c.messages else 0,
            "updated_at": c.updated_at,
        } for c in conversations],
        total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


# ============================================
# 预警推送
# ============================================

alert_router = APIRouter(prefix="/alerts", tags=["智能预警"])


@alert_router.get("/", response_model=PaginatedResponse)
async def list_alerts(
    severity: Optional[str] = None,
    unread_only: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """获取用户预警列表"""
    alerts, total = await AlertService.get_user_alerts(
        db, current_user["user_id"], severity, unread_only, page, page_size
    )
    return PaginatedResponse(
        items=alerts, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@alert_router.put("/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """标记预警已读"""
    await AlertService.mark_as_viewed(db, alert_id, current_user["user_id"])
    return {"status": "ok"}


# ============================================
# 研究员工作台
# ============================================

workbench_router = APIRouter(prefix="/workbench", tags=["研究员工作台"])


@workbench_router.get("/")
async def get_workbench(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """获取研究员工作台数据"""
    user_id = current_user["user_id"]

    # 今日待办
    todo_result = await db.execute(
        select(ResearchTask).where(
            ResearchTask.owner_id == user_id,
            ResearchTask.status.in_([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
        ).order_by(ResearchTask.priority).limit(10)
    )
    todos = [{"id": t.id, "title": t.title, "priority": t.priority.value, "status": t.status.value,
              "due_date": t.due_date.isoformat() if t.due_date else None}
             for t in todo_result.scalars().all()]

    # 待回复问题
    q_result = await db.execute(
        select(QuestionThread).where(
            QuestionThread.assignee_id == user_id,
            QuestionThread.status == QuestionStatus.OPEN,
        ).order_by(desc(QuestionThread.created_at)).limit(10)
    )
    pending_questions = [{"id": q.id, "question": q.question[:100], "asker_id": q.asker_id,
                          "created_at": q.created_at.isoformat()}
                         for q in q_result.scalars().all()]

    # 最近文档
    doc_result = await db.execute(
        select(Document).order_by(desc(Document.created_at)).limit(10)
    )
    recent_docs = [{"id": d.id, "title": d.title, "type": d.type.value, "created_at": d.created_at.isoformat()}
                   for d in doc_result.scalars().all()]

    # 未读预警数
    alert_count_result = await db.execute(
        select(func.count()).select_from(AlertDelivery).where(
            AlertDelivery.user_id == user_id,
            AlertDelivery.viewed_at.is_(None),
        )
    )
    unread_alerts = alert_count_result.scalar() or 0

    return {
        "todos": todos,
        "pending_questions": pending_questions,
        "recent_documents": recent_docs,
        "unread_alert_count": unread_alerts,
    }


# ============================================
# 基金经理驾驶舱
# ============================================

dashboard_router = APIRouter(prefix="/dashboard", tags=["决策驾驶舱"])


@dashboard_router.get("/")
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_pm),
):
    """获取基金经理驾驶舱数据"""
    user_id = current_user["user_id"]

    # 获取用户关注的公司 ID
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    coverage = user.coverage_scope or {} if user else {}
    watched_ids = coverage.get("portfolio_ids", []) + coverage.get("watchlist_ids", [])

    # 最近重点变化 (最近 7 天的高重要性文档)
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    changes_result = await db.execute(
        select(Document).where(
            Document.company_id.in_(watched_ids) if watched_ids else True,
            Document.created_at > week_ago,
        ).order_by(desc(Document.created_at)).limit(20)
    )
    key_changes = [{"id": d.id, "title": d.title, "type": d.type.value,
                     "company_id": d.company_id, "summary": d.summary,
                     "created_at": d.created_at.isoformat()}
                    for d in changes_result.scalars().all()]

    # 最新结论卡
    conclusions_result = await db.execute(
        select(ConclusionCard).where(
            ConclusionCard.company_id.in_(watched_ids) if watched_ids else True,
            ConclusionCard.is_latest == True,
        ).order_by(desc(ConclusionCard.updated_at)).limit(20)
    )
    summary_cards = [{"id": c.id, "company_id": c.company_id, "stance": c.stance.value,
                       "thesis": c.thesis[:200] if c.thesis else None,
                       "confidence_level": c.confidence_level.value,
                       "updated_at": c.updated_at.isoformat()}
                      for c in conclusions_result.scalars().all()]

    # 我的问题
    my_questions_result = await db.execute(
        select(QuestionThread).where(
            QuestionThread.asker_id == user_id,
        ).order_by(desc(QuestionThread.created_at)).limit(10)
    )
    my_questions = [{"id": q.id, "question": q.question[:100], "status": q.status.value,
                     "created_at": q.created_at.isoformat()}
                    for q in my_questions_result.scalars().all()]

    return {
        "key_changes": key_changes,
        "summary_cards": summary_cards,
        "my_questions": my_questions,
    }


# ============================================
# 管理层看板
# ============================================

management_router = APIRouter(prefix="/management", tags=["管理看板"])


@management_router.get("/stats")
async def get_management_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_leader),
):
    """获取管理层统计数据"""
    # 任务统计
    task_stats = {}
    for status in TaskStatus:
        count = (await db.execute(
            select(func.count()).select_from(ResearchTask).where(ResearchTask.status == status)
        )).scalar() or 0
        task_stats[status.value] = count

    # 问题响应统计
    question_total = (await db.execute(
        select(func.count()).select_from(QuestionThread)
    )).scalar() or 0
    question_answered = (await db.execute(
        select(func.count()).select_from(QuestionThread).where(
            QuestionThread.status.in_([QuestionStatus.ANSWERED, QuestionStatus.CLOSED])
        )
    )).scalar() or 0

    # 本周研究产出
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly_docs = (await db.execute(
        select(func.count()).select_from(Document).where(Document.created_at > week_ago)
    )).scalar() or 0
    weekly_conclusions = (await db.execute(
        select(func.count()).select_from(ConclusionCard).where(ConclusionCard.created_at > week_ago)
    )).scalar() or 0

    return {
        "task_overview": task_stats,
        "question_stats": {
            "total": question_total,
            "answered": question_answered,
            "response_rate": round(question_answered / max(question_total, 1) * 100, 1),
        },
        "weekly_output": {
            "documents": weekly_docs,
            "conclusions": weekly_conclusions,
        },
    }


# ============================================
# 多 Agent 协同 API
# ============================================

from app.services.multi_agent_service import multi_agent_service


multi_agent_router = APIRouter(prefix="/multi-agent", tags=["多 Agent 协同"])


@multi_agent_router.post("/comprehensive-research")
async def comprehensive_research(
    company_id: str,
    focus_areas: Optional[List[str]] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """
    综合研报生成 - 多 Agent 协同

    流程：
    1. Supervisor 分解任务
    2. 并行执行文档分析、事件分类等 Agent
    3. Synthesizer 汇总生成综合报告
    """
    result = await multi_agent_service.comprehensive_research(
        db=db,
        user_id=current_user["user_id"],
        company_id=company_id,
        focus_areas=focus_areas,
    )
    return result


@multi_agent_router.post("/event-analysis")
async def event_analysis(
    content: str,
    source: str,
    company_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """
    事件分析 - 多 Agent 协同

    流程：
    1. AlertClassificationAgent 分级
    2. DocumentAnalysisAgent 分析影响
    3. Synthesizer 汇总
    """
    result = await multi_agent_service.event_analysis(
        db=db,
        user_id=current_user["user_id"],
        content=content,
        source=source,
        company_id=company_id,
    )
    return result


@multi_agent_router.post("/peer-comparison")
async def peer_comparison(
    company_ids: List[str],
    metrics: Optional[List[str]] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """
    同行对比分析 - 多 Agent 协同

    流程：
    1. 获取多公司信息
    2. PeerComparisonAgent 对比分析
    3. DocumentAnalysisAgent 辅助分析
    """
    result = await multi_agent_service.peer_comparison_analysis(
        db=db,
        user_id=current_user["user_id"],
        company_ids=company_ids,
        metrics=metrics,
    )
    return result


@multi_agent_router.post("/research-qa")
async def research_qa_with_multi_agent(
    question: str,
    company_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """
    带上下文的研究问答 - 多 Agent 增强版

    流程：
    1. RAG 向量检索相关文档
    2. CopilotAgent 回答
    3. AlertClassificationAgent 检查是否触发预警
    """
    result = await multi_agent_service.research_qa_with_context(
        db=db,
        user_id=current_user["user_id"],
        question=question,
        company_id=company_id,
        conversation_id=conversation_id,
    )
    return result


@multi_agent_router.get("/orchestrate")
async def orchestrate_task(
    request: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """
    通用任务编排 - Supervisor 自动分解并协调多 Agent

    输入自然语言请求，Supervisor 自动分解任务并协调执行。
    """
    from app.agents import AgentFactory

    orchestrator = AgentFactory.get_orchestrator()
    result = await orchestrator.orchestrate(
        request=request,
        context={"user_id": current_user["user_id"]}
    )

    return {
        "task_id": result.task_id,
        "success": result.success,
        "execution_time": result.execution_time,
        "errors": result.errors,
        "final_result": result.final_result,
        "sub_tasks": [
            {
                "id": st.id,
                "agent": st.agent_name,
                "description": st.description,
                "status": st.status.value,
                "result": st.result,
                "error": st.error,
            }
            for st in result.sub_tasks
        ],
    }
