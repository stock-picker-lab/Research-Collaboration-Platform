"""
投研协作平台 - 数据库模型 v2.0
基于高保真设计图重构，新增持仓、观察池、数据源等模型
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
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import uuid

from app.core.database import Base


# ============================================
# 枚举定义
# ============================================

class UserRole(str, enum.Enum):
    RESEARCHER = "researcher"  # 研究员
    PM = "pm"                 # 基金经理
    LEADER = "leader"         # 研究所领导
    ADMIN = "admin"           # 系统管理员


class TaskStatus(str, enum.Enum):
    PENDING = "pending"           # 待开始
    IN_PROGRESS = "in_progress"   # 进行中
    UNDER_REVIEW = "under_review" # 审核中
    COMPLETED = "completed"       # 已完成
    CANCELLED = "cancelled"      # 已取消


class TaskPriority(str, enum.Enum):
    P0 = "P0"   # 紧急
    P1 = "P1"   # 重要
    P2 = "P2"   # 常规


class TemplateType(str, enum.Enum):
    DEEP_RESEARCH = "deep_research"       # 个股深度研究
    EARNINGS_REVIEW = "earnings_review"   # 财报快速点评
    EVENT_REVIEW = "event_review"          # 事件点评
    PEER_COMPARISON = "peer_comparison"    # 同行比较
    TRANSCRIPT_SUMMARY = "transcript_summary"  # 电话会纪要整理


class DocumentType(str, enum.Enum):
    RESEARCH_REPORT = "research_report"  # 研报
    ANNOUNCEMENT = "announcement"        # 公告
    ANNUAL_REPORT = "annual_report"      # 年报
    TRANSCRIPT = "transcript"             # 纪要
    OTHER = "other"                      # 其他


class Stance(str, enum.Enum):
    BULLISH = "bullish"   # 买入
    NEUTRAL = "neutral"   # 中性
    CAUTIOUS = "cautious" # 谨慎
    BEARISH = "bearish"   # 回避


class ConfidenceLevel(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class QuestionStatus(str, enum.Enum):
    OPEN = "open"       # 待答复
    ANSWERED = "answered"  # 已答复
    CLOSED = "closed"      # 已关闭


class AlertSeverity(str, enum.Enum):
    P0 = "P0"   # 紧急
    P1 = "P1"   # 重要
    P2 = "P2"   # 常规


class AlertType(str, enum.Enum):
    EARNINGS = "earnings"           # 财报发布
    ANNOUNCEMENT = "announcement"   # 重大公告
    MANAGEMENT_CHANGE = "management_change"  # 高管变动
    PRODUCT_LAUNCH = "product_launch"  # 产品发布
    INDUSTRY_POLICY = "industry_policy"  # 行业政策
    NEWS = "news"                   # 新闻
    REGULAR = "regular"             # 常规更新


class PushChannel(str, enum.Enum):
    IN_APP = "in_app"     # 站内消息
    EMAIL = "email"       # 邮件
    SMS = "sms"           # 短信
    WECHAT = "wechat"     # 企业微信


class DataSourceType(str, enum.Enum):
    EXTERNAL_API = "external_api"  # 外部API
    INTERNAL_DB = "internal_db"    # 内部数据库
    FILE_IMPORT = "file_import"    # 文件导入
    MANUAL = "manual"              # 手动录入


class DataSourceStatus(str, enum.Enum):
    ACTIVE = "active"     # 正常
    SYNCING = "syncing"    # 同步中
    ERROR = "error"        # 错误
    DISABLED = "disabled"  # 已禁用


class ConclusionStatus(str, enum.Enum):
    DRAFT = "draft"       # 草稿
    PUBLISHED = "published"  # 已发布
    ARCHIVED = "archived"   # 已归档


class PortfolioStatus(str, enum.Enum):
    ACTIVE = "active"     # 持仓中
    CLOSED = "closed"      # 已平仓
    WATCHLIST = "watchlist"  # 观察池


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
    team: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # 所属团队/组
    title: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # 职位
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # 研究员专属：覆盖范围
    coverage_companies: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # 覆盖公司ID列表
    coverage_industries: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # 覆盖行业列表

    # 基金经理专属：组合
    portfolio_ids: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    watchlist_ids: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)

    # Relationships
    tasks: Mapped[List["ResearchTask"]] = relationship(back_populates="assignee", foreign_keys="ResearchTask.assignee_id")
    tasks_created: Mapped[List["ResearchTask"]] = relationship(back_populates="creator", foreign_keys="ResearchTask.created_by_id")
    conclusion_cards: Mapped[List["ConclusionCard"]] = relationship(back_populates="author")
    questions_asked: Mapped[List["QuestionThread"]] = relationship(back_populates="asker", foreign_keys="QuestionThread.asker_id")
    questions_assigned: Mapped[List["QuestionThread"]] = relationship(back_populates="researcher", foreign_keys="QuestionThread.researcher_id")
    portfolios: Mapped[List["Portfolio"]] = relationship(back_populates="pm_user", foreign_keys="Portfolio.pm_user_id")
    watchlists: Mapped[List["Watchlist"]] = relationship(back_populates="pm_user", foreign_keys="Watchlist.pm_user_id")
    alerts: Mapped[List["Alert"]] = relationship(back_populates="recipient", foreign_keys="Alert.recipient_id")
    notification_settings: Mapped[List["NotificationSetting"]] = relationship(back_populates="user")
    audit_logs: Mapped[List["AuditLog"]] = relationship(back_populates="user")

    __table_args__ = (
        Index("ix_users_role", "role"),
        Index("ix_users_team", "team"),
    )


class Company(Base, AuditMixin):
    """公司/标的模型"""
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(128), index=True)
    ticker: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    exchange: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)  # SH/SZ
    industry: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    sector: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    market_cap: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 市值（亿元）
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # 标签列表
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    documents: Mapped[List["Document"]] = relationship(back_populates="company")
    conclusion_cards: Mapped[List["ConclusionCard"]] = relationship(back_populates="company")
    questions: Mapped[List["QuestionThread"]] = relationship(back_populates="company")
    portfolios: Mapped[List["Portfolio"]] = relationship(back_populates="company")
    watchlists: Mapped[List["Watchlist"]] = relationship(back_populates="company")

    __table_args__ = (
        Index("ix_companies_industry", "industry"),
        Index("ix_companies_sector", "sector"),
    )


class Portfolio(Base, AuditMixin):
    """持仓模型（基金经理）"""
    __tablename__ = "portfolios"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    pm_user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    company_id: Mapped[str] = mapped_column(String(64), ForeignKey("companies.id"))
    shares: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 持股数量
    weight: Mapped[float] = mapped_column(Float, default=0.0)  # 持仓权重 %
    avg_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 平均成本
    current_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 当前价格
    stance: Mapped[Stance] = mapped_column(Enum(Stance), default=Stance.NEUTRAL)
    status: Mapped[PortfolioStatus] = mapped_column(Enum(PortfolioStatus), default=PortfolioStatus.ACTIVE)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    pm_user: Mapped["User"] = relationship(back_populates="portfolios", foreign_keys=[pm_user_id])
    company: Mapped["Company"] = relationship(back_populates="portfolios")

    __table_args__ = (
        UniqueConstraint("pm_user_id", "company_id", name="uq_portfolio_pm_company"),
        Index("ix_portfolios_pm_user", "pm_user_id"),
    )


class Watchlist(Base, AuditMixin):
    """观察池模型（基金经理）"""
    __tablename__ = "watchlists"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    pm_user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    company_id: Mapped[str] = mapped_column(String(64), ForeignKey("companies.id"))
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # 添加原因
    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    status: Mapped[PortfolioStatus] = mapped_column(Enum(PortfolioStatus), default=PortfolioStatus.WATCHLIST)

    # Relationships
    pm_user: Mapped["User"] = relationship(back_populates="watchlists", foreign_keys=[pm_user_id])
    company: Mapped["Company"] = relationship(back_populates="watchlists")

    __table_args__ = (
        UniqueConstraint("pm_user_id", "company_id", name="uq_watchlist_pm_company"),
        Index("ix_watchlists_pm_user", "pm_user_id"),
    )


class Document(Base, AuditMixin):
    """文档模型"""
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("companies.id"), nullable=True)
    uploader_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(512))
    doc_type: Mapped[DocumentType] = mapped_column(Enum(DocumentType))
    file_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)  # 文件存储路径
    file_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 文件大小(bytes)
    file_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # 文件哈希
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # 文本内容（OCR/解析后）
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # AI 摘要
    tags: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    publish_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)  # 发布时间
    event_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)  # 事件类型（用于公告）
    importance: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)  # 重要程度
    is_new: Mapped[bool] = mapped_column(Boolean, default=False)  # 是否有新增

    # Relationships
    company: Mapped[Optional["Company"]] = relationship(back_populates="documents")
    uploader: Mapped[Optional["User"]] = relationship()
    team_shares: Mapped[List["TeamDocument"]] = relationship(back_populates="document")

    __table_args__ = (
        Index("ix_documents_company", "company_id"),
        Index("ix_documents_type", "doc_type"),
        Index("ix_documents_publish_time", "publish_time"),
    )


class ResearchTask(Base, AuditMixin):
    """研究任务模型"""
    __tablename__ = "research_tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("companies.id"), nullable=True)
    assignee_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    reviewer_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    created_by_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    template_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("research_templates.id"), nullable=True)

    title: Mapped[str] = mapped_column(String(256))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    type: Mapped[TemplateType] = mapped_column(Enum(TemplateType), default=TemplateType.DEEP_RESEARCH)
    status: Mapped[TaskStatus] = mapped_column(Enum(TaskStatus), default=TaskStatus.PENDING)
    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority), default=TaskPriority.P1)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # 工作流进度（JSON: [{step_id, step_title, status, completed_at}])
    workflow_progress: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    current_step: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 当前步骤索引

    # Relationships
    company: Mapped[Optional["Company"]] = relationship()
    assignee: Mapped["User"] = relationship(back_populates="tasks", foreign_keys=[assignee_id])
    reviewer: Mapped[Optional["User"]] = relationship(foreign_keys=[reviewer_id])
    creator: Mapped[Optional["User"]] = relationship(back_populates="tasks_created", foreign_keys=[created_by_id])
    template: Mapped[Optional["ResearchTemplate"]] = relationship()

    __table_args__ = (
        Index("ix_research_tasks_status", "status"),
        Index("ix_research_tasks_assignee", "assignee_id"),
        Index("ix_research_tasks_due_date", "due_date"),
    )


class ConclusionCard(Base, AuditMixin):
    """结论卡模型"""
    __tablename__ = "conclusion_cards"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[str] = mapped_column(String(64), ForeignKey("companies.id"), index=True)
    author_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    template_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("research_templates.id"), nullable=True)
    task_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("research_tasks.id"), nullable=True)

    # 3-3-2-1 结构
    core_conclusions: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # 3个核心结论 [{text, evidence}]
    key_changes: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)       # 3个关键变化 [text]
    risk_points: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)     # 2个风险点 [text]
    questions_to_watch: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # 1个建议关注问题 [text]

    # 评级信息
    stance: Mapped[Stance] = mapped_column(Enum(Stance), default=Stance.NEUTRAL)
    target_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 目标价
    upside: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 潜在空间 %
    confidence: Mapped[ConfidenceLevel] = mapped_column(Enum(ConfidenceLevel), default=ConfidenceLevel.MEDIUM)

    status: Mapped[ConclusionStatus] = mapped_column(Enum(ConclusionStatus), default=ConclusionStatus.DRAFT)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)

    # Relationships
    company: Mapped["Company"] = relationship(back_populates="conclusion_cards")
    author: Mapped["User"] = relationship(back_populates="conclusion_cards")
    template: Mapped[Optional["ResearchTemplate"]] = relationship()
    task: Mapped[Optional["ResearchTask"]] = relationship()


class QuestionThread(Base, AuditMixin):
    """问题追踪模型"""
    __tablename__ = "question_threads"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("companies.id"), nullable=True)
    asker_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    researcher_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))  # 指派给的研究员
    task_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("research_tasks.id"), nullable=True)

    title: Mapped[str] = mapped_column(String(256))
    content: Mapped[str] = mapped_column(Text)
    answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    answer_citations: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # 引用文档
    status: Mapped[QuestionStatus] = mapped_column(Enum(QuestionStatus), default=QuestionStatus.OPEN)
    priority: Mapped[TaskPriority] = mapped_column(Enum(TaskPriority), default=TaskPriority.P1)
    answered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    company: Mapped[Optional["Company"]] = relationship(back_populates="questions")
    asker: Mapped["User"] = relationship(back_populates="questions_asked", foreign_keys=[asker_id])
    researcher: Mapped["User"] = relationship(back_populates="questions_assigned", foreign_keys=[researcher_id])
    task: Mapped[Optional["ResearchTask"]] = relationship()

    __table_args__ = (
        Index("ix_question_threads_status", "status"),
        Index("ix_question_threads_asker", "asker_id"),
        Index("ix_question_threads_researcher", "researcher_id"),
        Index("ix_question_threads_company", "company_id"),
    )


class Alert(Base, AuditMixin):
    """预警模型"""
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    company_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("companies.id"), nullable=True)
    recipient_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    document_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("documents.id"), nullable=True)

    alert_type: Mapped[AlertType] = mapped_column(Enum(AlertType))
    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity))
    title: Mapped[str] = mapped_column(String(512))
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # 额外数据（事件影响等）
    extra_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    # Relationships
    company: Mapped[Optional["Company"]] = relationship()
    recipient: Mapped[Optional["User"]] = relationship(back_populates="alerts", foreign_keys=[recipient_id])
    document: Mapped[Optional["Document"]] = relationship()

    __table_args__ = (
        Index("ix_alerts_recipient", "recipient_id"),
        Index("ix_alerts_severity", "severity"),
        Index("ix_alerts_is_read", "is_read"),
        Index("ix_alerts_created_at", "created_at"),
    )


class ResearchTemplate(Base, AuditMixin):
    """研究模板模型"""
    __tablename__ = "research_templates"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(128))
    type: Mapped[TemplateType] = mapped_column(Enum(TemplateType))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # sections: [{"id": "step1", "title": "资料收集", "required": true, "hints": [...]}]
    sections: Mapped[list] = mapped_column(JSON)

    is_system_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)  # 使用次数


class TeamDocument(Base, AuditMixin):
    """团队文档共享"""
    __tablename__ = "team_documents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String(64), ForeignKey("documents.id"))
    shared_by: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))
    team: Mapped[str] = mapped_column(String(64))  # 团队名称
    permission: Mapped[str] = mapped_column(String(16), default="view")  # view/comment/edit

    # Relationships
    document: Mapped["Document"] = relationship(back_populates="team_shares")
    sharer: Mapped[Optional["User"]] = relationship()


class DataSource(Base, AuditMixin):
    """数据源管理"""
    __tablename__ = "data_sources"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(128))
    type: Mapped[DataSourceType] = mapped_column(Enum(DataSourceType))
    config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # 连接配置（加密存储）
    status: Mapped[DataSourceStatus] = mapped_column(Enum(DataSourceStatus), default=DataSourceStatus.ACTIVE)
    sync_frequency: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)  # 同步频率
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class NotificationSetting(Base, AuditMixin):
    """通知设置"""
    __tablename__ = "notification_settings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"))

    # 推送渠道
    channel_in_app: Mapped[bool] = mapped_column(Boolean, default=True)
    channel_email: Mapped[bool] = mapped_column(Boolean, default=True)
    channel_sms: Mapped[bool] = mapped_column(Boolean, default=False)
    channel_wechat: Mapped[bool] = mapped_column(Boolean, default=False)

    # 免打扰时段
    quiet_hours_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    quiet_hours_start: Mapped[Optional[str]] = mapped_column(String(8), nullable=True)  # "22:00"
    quiet_hours_end: Mapped[Optional[str]] = mapped_column(String(8), nullable=True)    # "08:00"

    # 接收哪些级别的预警
    receive_p0: Mapped[bool] = mapped_column(Boolean, default=True)
    receive_p1: Mapped[bool] = mapped_column(Boolean, default=True)
    receive_p2: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="notification_settings")


class AuditLog(Base, AuditMixin):
    """审计日志"""
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(64))  # login/logout/create/update/delete
    object_type: Mapped[str] = mapped_column(String(64))  # User/Company/Document/ConclusionCard...
    object_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # 额外详情
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Relationships
    user: Mapped[Optional["User"]] = relationship(back_populates="audit_logs")

    __table_args__ = (
        Index("ix_audit_logs_user", "user_id"),
        Index("ix_audit_logs_action", "action"),
        Index("ix_audit_logs_object", "object_type", "object_id"),
        Index("ix_audit_logs_created_at", "created_at"),
    )


# ============================================
# 向量检索扩展表 (可选)
# ============================================

class DocumentChunk(Base):
    """文档分块（用于向量检索）"""
    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String(64), ForeignKey("documents.id", ondelete="CASCADE"))
    chunk_index: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    section_title: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    # 向量字段 - 如使用 pgvector，可取消下面这行注释
    # embedding: Mapped[Optional[list]] = mapped_column(Vector(1536), nullable=True)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)

    __table_args__ = (
        Index("ix_document_chunks_document", "document_id"),
    )
