"""
投研协作平台 - 数据库模型
核心实体定义 (SQLAlchemy ORM)
"""
from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import (
    String, Text, Integer, Float, Boolean, DateTime, Enum, ForeignKey,
    JSON, Index, UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ARRAY, UUID as PG_UUID
from pgvector.sqlalchemy import Vector
import uuid

from app.core.database import Base


# ============================================
# 枚举定义
# ============================================

class UserRole(str, enum.Enum):
    RESEARCHER = "researcher"
    PM = "pm"
    LEADER = "leader"
    ADMIN = "admin"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    UNDER_REVIEW = "under_review"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, enum.Enum):
    URGENT = "urgent"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TaskType(str, enum.Enum):
    DEEP_RESEARCH = "deep_research"
    EARNINGS_REVIEW = "earnings_review"
    EVENT_REVIEW = "event_review"
    PEER_COMPARISON = "peer_comparison"
    TRANSCRIPT_SUMMARY = "transcript_summary"
    GENERAL = "general"


class DocumentType(str, enum.Enum):
    REPORT = "report"
    ANNOUNCEMENT = "announcement"
    FILING = "filing"
    NEWS = "news"
    MEMO = "memo"
    TRANSCRIPT = "transcript"


class Stance(str, enum.Enum):
    BULLISH = "bullish"          # 看多
    NEUTRAL = "neutral"          # 中性
    CAUTIOUS = "cautious"        # 谨慎
    BEARISH = "bearish"          # 回避


class ConfidenceLevel(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AssumptionStatus(str, enum.Enum):
    PENDING = "pending"              # 待验证
    VERIFIED = "verified"            # 已验证
    BROKEN = "broken"                # 已打破
    PARTIALLY_VERIFIED = "partially_verified"  # 部分验证


class QuestionStatus(str, enum.Enum):
    OPEN = "open"                    # 待答复
    ANSWERED = "answered"            # 已答复
    PENDING_VERIFICATION = "pending_verification"  # 待验证
    CLOSED = "closed"                # 已关闭


class AlertSeverity(str, enum.Enum):
    P0 = "P0"    # 紧急
    P1 = "P1"    # 重要
    P2 = "P2"    # 常规


class AlertPushStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    VIEWED = "viewed"
    ACTED = "acted"


class ConflictType(str, enum.Enum):
    DIRECTION = "direction"
    ASSUMPTION = "assumption"
    LOGIC = "logic"


class ConflictResolutionStatus(str, enum.Enum):
    OPEN = "open"
    DISCUSSING = "discussing"
    RESOLVED = "resolved"


class TemplateType(str, enum.Enum):
    DEEP_RESEARCH = "deep_research"
    EARNINGS_REVIEW = "earnings_review"
    EVENT_REVIEW = "event_review"
    PEER_COMPARISON = "peer_comparison"
    TRANSCRIPT_SUMMARY = "transcript_summary"


# ============================================
# Mixin: 审计字段
# ============================================

class AuditMixin:
    """所有核心实体的审计字段"""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    created_by: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    updated_by: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)


# ============================================
# 模型定义
# ============================================

class User(Base, AuditMixin):
    """用户模型"""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(256))
    name: Mapped[str] = mapped_column(String(64))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.RESEARCHER)
    team: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    coverage_scope: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Preferences
    push_preferences: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    dashboard_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    tasks: Mapped[List["ResearchTask"]] = relationship(back_populates="owner", foreign_keys="ResearchTask.owner_id")
    conclusion_cards: Mapped[List["ConclusionCard"]] = relationship(back_populates="author")
    questions_asked: Mapped[List["QuestionThread"]] = relationship(
        back_populates="asker", foreign_keys="QuestionThread.asker_id"
    )
    questions_assigned: Mapped[List["QuestionThread"]] = relationship(
        back_populates="assignee", foreign_keys="QuestionThread.assignee_id"
    )


class Company(Base, AuditMixin):
    """公司/标的模型"""
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(128), index=True)
    ticker: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    industry: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    sector: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    tags: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    peer_list: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    supply_chain_up: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    supply_chain_down: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    documents: Mapped[List["Document"]] = relationship(back_populates="company")
    conclusion_cards: Mapped[List["ConclusionCard"]] = relationship(back_populates="company")


class ResearchTask(Base, AuditMixin):
    """研究任务模型"""
    __tablename__ = "research_tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(256))
    type: Mapped[TaskType] = mapped_column(Enum(TaskType), default=TaskType.GENERAL)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    related_company_ids: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    owner_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    collaborator_ids: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus), default=TaskStatus.PENDING)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    template_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("research_templates.id"), nullable=True)
    workflow_status: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="tasks", foreign_keys=[owner_id])
    template: Mapped[Optional["ResearchTemplate"]] = relationship()

    __table_args__ = (
        Index("ix_research_tasks_status", "status"),
        Index("ix_research_tasks_owner", "owner_id"),
        Index("ix_research_tasks_due_date", "due_date"),
    )


class Document(Base, AuditMixin):
    """文档模型"""
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(512))
    type: Mapped[DocumentType] = mapped_column(Enum(DocumentType))
    source: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    company_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("companies.id"), nullable=True)
    related_company_ids: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    publish_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    summary: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ai_analysis: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    tags: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    file_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    event_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    importance: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)

    # Relationships
    company: Mapped[Optional["Company"]] = relationship(back_populates="documents")
    chunks: Mapped[List["DocumentChunk"]] = relationship(back_populates="document", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_documents_company", "company_id"),
        Index("ix_documents_type", "type"),
        Index("ix_documents_publish_time", "publish_time"),
    )


class DocumentChunk(Base):
    """文档分块 (用于向量检索)"""
    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String(64), ForeignKey("documents.id", ondelete="CASCADE"))
    chunk_index: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    section_title: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    embedding: Mapped[Optional[list]] = mapped_column(Vector(1536), nullable=True)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)

    # Relationships
    document: Mapped["Document"] = relationship(back_populates="chunks")

    __table_args__ = (
        Index("ix_document_chunks_document", "document_id"),
    )


class ConclusionCard(Base, AuditMixin):
    """结论卡模型"""
    __tablename__ = "conclusion_cards"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(64), ForeignKey("companies.id"), index=True)
    author_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    stance: Mapped[Stance] = mapped_column(Enum(Stance), default=Stance.NEUTRAL)
    thesis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    risks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    key_metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    confidence_level: Mapped[ConfidenceLevel] = mapped_column(
        Enum(ConfidenceLevel), default=ConfidenceLevel.MEDIUM
    )
    citations: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_latest: Mapped[bool] = mapped_column(Boolean, default=True)
    previous_version_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    change_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    company: Mapped["Company"] = relationship(back_populates="conclusion_cards")
    author: Mapped["User"] = relationship(back_populates="conclusion_cards")
    assumptions: Mapped[List["Assumption"]] = relationship(back_populates="conclusion_card", cascade="all, delete-orphan")


class Assumption(Base, AuditMixin):
    """研究假设模型"""
    __tablename__ = "assumptions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    conclusion_card_id: Mapped[str] = mapped_column(String(64), ForeignKey("conclusion_cards.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(String(64))
    description: Mapped[str] = mapped_column(Text)
    expected_value: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    actual_value: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    deviation_ratio: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    validation_metrics: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    trigger_conditions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[AssumptionStatus] = mapped_column(
        Enum(AssumptionStatus), default=AssumptionStatus.PENDING
    )
    auto_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    conclusion_card: Mapped["ConclusionCard"] = relationship(back_populates="assumptions")


class QuestionThread(Base, AuditMixin):
    """问题追踪模型"""
    __tablename__ = "question_threads"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("companies.id"), nullable=True)
    asker_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    assignee_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    answer_citations: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    status: Mapped[QuestionStatus] = mapped_column(Enum(QuestionStatus), default=QuestionStatus.OPEN)
    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    parent_thread_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    follow_up_thread_ids: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    # Relationships
    asker: Mapped["User"] = relationship(back_populates="questions_asked", foreign_keys=[asker_id])
    assignee: Mapped["User"] = relationship(back_populates="questions_assigned", foreign_keys=[assignee_id])

    __table_args__ = (
        Index("ix_question_threads_status", "status"),
        Index("ix_question_threads_asker", "asker_id"),
        Index("ix_question_threads_assignee", "assignee_id"),
    )


class Alert(Base, AuditMixin):
    """智能预警模型"""
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type: Mapped[str] = mapped_column(String(64), index=True)
    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity))
    related_company_ids: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    title: Mapped[str] = mapped_column(String(512))
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_document_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("documents.id"), nullable=True)
    detail: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    __table_args__ = (
        Index("ix_alerts_severity", "severity"),
        Index("ix_alerts_created_at", "created_at"),
    )


class AlertDelivery(Base):
    """预警推送记录"""
    __tablename__ = "alert_deliveries"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_id: Mapped[str] = mapped_column(String(64), ForeignKey("alerts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), index=True)
    channel: Mapped[str] = mapped_column(String(32))  # in_app / email / wecom
    push_status: Mapped[AlertPushStatus] = mapped_column(Enum(AlertPushStatus), default=AlertPushStatus.PENDING)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    viewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    acted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class ResearchTemplate(Base, AuditMixin):
    """研究模板模型"""
    __tablename__ = "research_templates"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(128))
    type: Mapped[TemplateType] = mapped_column(Enum(TemplateType))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sections: Mapped[dict] = mapped_column(JSON)
    required_fields: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    ai_tools_binding: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_system_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class QABookmark(Base, AuditMixin):
    """问答收藏模型"""
    __tablename__ = "qa_bookmarks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), index=True)
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    source_citations: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    company_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("companies.id"), nullable=True)
    annotations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)


class ViewpointConflict(Base, AuditMixin):
    """观点冲突记录模型"""
    __tablename__ = "viewpoint_conflicts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(64), ForeignKey("companies.id"), index=True)
    researcher_ids: Mapped[list] = mapped_column(JSON)
    conflict_type: Mapped[ConflictType] = mapped_column(Enum(ConflictType))
    description: Mapped[str] = mapped_column(Text)
    resolution_status: Mapped[ConflictResolutionStatus] = mapped_column(
        Enum(ConflictResolutionStatus), default=ConflictResolutionStatus.OPEN
    )
    resolution_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class ActivityLog(Base):
    """操作审计日志"""
    __tablename__ = "activity_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    object_type: Mapped[str] = mapped_column(String(64))
    object_id: Mapped[str] = mapped_column(String(64))
    action: Mapped[str] = mapped_column(String(64))
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)

    __table_args__ = (
        Index("ix_activity_logs_object", "object_type", "object_id"),
    )


class CopilotConversation(Base, AuditMixin):
    """Copilot 对话记录 (支持多轮追问)"""
    __tablename__ = "copilot_conversations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), index=True)
    company_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("companies.id"), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    messages: Mapped[list] = mapped_column(JSON, default=list)
    context: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    is_bookmarked: Mapped[bool] = mapped_column(Boolean, default=False)
