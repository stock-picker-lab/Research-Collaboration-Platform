"""
投研协作平台 - 研究任务 & 结论卡 & 问题追踪 API
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, allow_all, allow_researcher, allow_pm
from app.core.event_bus import event_bus, EventTypes
from app.models.models import (
    ResearchTask, ConclusionCard, Assumption, QuestionThread,
    TaskStatus, QuestionStatus,
)
from app.schemas import (
    TaskCreate, TaskResponse, TaskUpdate,
    ConclusionCardCreate, ConclusionCardResponse,
    AssumptionCreate, AssumptionResponse,
    QuestionCreate, QuestionResponse, QuestionAnswer,
    PaginatedResponse,
)

# ============================================
# 研究任务
# ============================================

task_router = APIRouter(prefix="/tasks", tags=["研究任务"])


@task_router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(
    data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_researcher),
):
    """创建研究任务"""
    task = ResearchTask(
        title=data.title,
        type=data.type,
        description=data.description,
        related_company_ids=data.related_company_ids,
        owner_id=current_user["user_id"],
        collaborator_ids=data.collaborator_ids,
        priority=data.priority,
        due_date=data.due_date,
        template_id=data.template_id,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
    )
    db.add(task)
    await db.flush()

    await event_bus.publish(EventTypes.TASK_CREATED, {
        "task_id": task.id,
        "title": task.title,
        "owner_id": task.owner_id,
    })

    return TaskResponse.model_validate(task)


@task_router.get("/", response_model=PaginatedResponse)
async def list_tasks(
    status: Optional[str] = None,
    owner_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """获取任务列表"""
    query = select(ResearchTask)
    if status:
        query = query.where(ResearchTask.status == TaskStatus(status))
    if owner_id:
        query = query.where(ResearchTask.owner_id == owner_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(desc(ResearchTask.created_at)).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [TaskResponse.model_validate(t) for t in result.scalars().all()]

    return PaginatedResponse(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@task_router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_researcher),
):
    """更新任务"""
    result = await db.execute(select(ResearchTask).where(ResearchTask.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    task.updated_by = current_user["user_id"]
    await db.flush()

    if data.status == "completed":
        await event_bus.publish(EventTypes.TASK_COMPLETED, {
            "task_id": task.id, "title": task.title, "owner_id": task.owner_id,
        })

    return TaskResponse.model_validate(task)


# ============================================
# 结论卡
# ============================================

conclusion_router = APIRouter(prefix="/conclusions", tags=["结论卡"])


@conclusion_router.post("/", response_model=ConclusionCardResponse, status_code=201)
async def create_conclusion(
    data: ConclusionCardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_researcher),
):
    """创建/更新结论卡 (新版本)"""
    # 将当前最新版标记为非最新
    existing = await db.execute(
        select(ConclusionCard).where(
            ConclusionCard.company_id == data.company_id,
            ConclusionCard.author_id == current_user["user_id"],
            ConclusionCard.is_latest == True,
        )
    )
    current_latest = existing.scalar_one_or_none()
    version = 1
    previous_id = None

    if current_latest:
        current_latest.is_latest = False
        version = current_latest.version + 1
        previous_id = current_latest.id

    card = ConclusionCard(
        company_id=data.company_id,
        author_id=current_user["user_id"],
        stance=data.stance,
        thesis=data.thesis,
        risks=data.risks,
        key_metrics=data.key_metrics,
        confidence_level=data.confidence_level,
        citations=data.citations,
        version=version,
        is_latest=True,
        previous_version_id=previous_id,
        change_reason=data.change_reason,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
    )
    db.add(card)
    await db.flush()

    await event_bus.publish(EventTypes.CONCLUSION_UPDATED, {
        "conclusion_id": card.id,
        "company_id": card.company_id,
        "stance": card.stance,
        "version": card.version,
        "author_id": current_user["user_id"],
    })

    return ConclusionCardResponse.model_validate(card)


@conclusion_router.get("/company/{company_id}", response_model=list[ConclusionCardResponse])
async def get_company_conclusions(
    company_id: str,
    include_history: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """获取公司的结论卡"""
    query = select(ConclusionCard).where(ConclusionCard.company_id == company_id)
    if not include_history:
        query = query.where(ConclusionCard.is_latest == True)
    query = query.order_by(desc(ConclusionCard.updated_at))

    result = await db.execute(query)
    return [ConclusionCardResponse.model_validate(c) for c in result.scalars().all()]


# ============================================
# 假设管理
# ============================================

assumption_router = APIRouter(prefix="/assumptions", tags=["假设管理"])


@assumption_router.post("/", response_model=AssumptionResponse, status_code=201)
async def create_assumption(
    data: AssumptionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_researcher),
):
    """创建研究假设"""
    assumption = Assumption(
        conclusion_card_id=data.conclusion_card_id,
        type=data.type,
        description=data.description,
        expected_value=data.expected_value,
        validation_metrics=data.validation_metrics,
        trigger_conditions=data.trigger_conditions,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
    )
    db.add(assumption)
    await db.flush()
    return AssumptionResponse.model_validate(assumption)


# ============================================
# 问题追踪
# ============================================

question_router = APIRouter(prefix="/questions", tags=["问题追踪"])


@question_router.post("/", response_model=QuestionResponse, status_code=201)
async def create_question(
    data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_pm),
):
    """基金经理发起问题"""
    question = QuestionThread(
        company_id=data.company_id,
        asker_id=current_user["user_id"],
        assignee_id=data.assignee_id,
        question=data.question,
        priority=data.priority,
        parent_thread_id=data.parent_thread_id,
        created_by=current_user["user_id"],
        updated_by=current_user["user_id"],
    )
    db.add(question)
    await db.flush()

    await event_bus.publish(EventTypes.QUESTION_CREATED, {
        "question_id": question.id,
        "asker_id": current_user["user_id"],
        "assignee_id": data.assignee_id,
        "company_id": data.company_id,
    })

    return QuestionResponse.model_validate(question)


@question_router.get("/", response_model=PaginatedResponse)
async def list_questions(
    role: Optional[str] = None,
    status: Optional[str] = None,
    company_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_all),
):
    """获取问题列表"""
    query = select(QuestionThread)

    if status:
        query = query.where(QuestionThread.status == QuestionStatus(status))
    if company_id:
        query = query.where(QuestionThread.company_id == company_id)

    # 根据角色过滤
    user_role = current_user.get("role")
    user_id = current_user["user_id"]
    if user_role == "pm":
        query = query.where(QuestionThread.asker_id == user_id)
    elif user_role == "researcher":
        query = query.where(QuestionThread.assignee_id == user_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(desc(QuestionThread.created_at)).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = [QuestionResponse.model_validate(q) for q in result.scalars().all()]

    return PaginatedResponse(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@question_router.put("/{question_id}/answer", response_model=QuestionResponse)
async def answer_question(
    question_id: str,
    data: QuestionAnswer,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(allow_researcher),
):
    """研究员答复问题"""
    result = await db.execute(select(QuestionThread).where(QuestionThread.id == question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="问题不存在")

    question.answer = data.answer
    question.answer_citations = data.citations
    question.status = QuestionStatus.ANSWERED
    question.updated_by = current_user["user_id"]
    await db.flush()

    await event_bus.publish(EventTypes.QUESTION_ANSWERED, {
        "question_id": question.id,
        "asker_id": question.asker_id,
        "assignee_id": question.assignee_id,
    })

    return QuestionResponse.model_validate(question)
