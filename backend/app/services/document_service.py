"""
投研协作平台 - 文档服务
文档管理、上传、AI 自动解读
"""
from __future__ import annotations

from typing import Optional, List
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.models.models import Document, DocumentChunk, Company, Alert, AlertSeverity
from app.schemas import DocumentCreate, DocumentResponse, DocumentAnalysisResponse
from app.agents import AgentFactory
from app.core.event_bus import event_bus, EventTypes

import structlog

logger = structlog.get_logger()


class DocumentService:
    """文档业务逻辑"""

    @staticmethod
    async def create_document(
        db: AsyncSession,
        data: DocumentCreate,
        user_id: str,
        file_url: Optional[str] = None,
    ) -> Document:
        """创建文档记录"""
        doc = Document(
            title=data.title,
            type=data.type,
            source=data.source,
            company_id=data.company_id,
            related_company_ids=data.related_company_ids,
            publish_time=data.publish_time,
            content=data.content,
            tags=data.tags,
            file_url=file_url,
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(doc)
        await db.flush()

        # 发布文档创建事件
        await event_bus.publish(EventTypes.DOCUMENT_CREATED, {
            "document_id": doc.id,
            "title": doc.title,
            "type": doc.type,
            "company_id": doc.company_id,
            "user_id": user_id,
        })

        return doc

    @staticmethod
    async def get_document(db: AsyncSession, document_id: str) -> Optional[Document]:
        """获取单个文档"""
        result = await db.execute(select(Document).where(Document.id == document_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def list_documents(
        db: AsyncSession,
        company_id: Optional[str] = None,
        doc_type: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[Document], int]:
        """获取文档列表"""
        query = select(Document)
        count_query = select(Document)

        if company_id:
            query = query.where(Document.company_id == company_id)
            count_query = count_query.where(Document.company_id == company_id)
        if doc_type:
            query = query.where(Document.type == doc_type)
            count_query = count_query.where(Document.type == doc_type)

        # 总数
        total_result = await db.execute(count_query)
        total = len(total_result.all())

        # 分页
        query = query.order_by(desc(Document.publish_time)).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        documents = result.scalars().all()

        return documents, total

    @staticmethod
    async def analyze_document(db: AsyncSession, document_id: str) -> dict:
        """AI 自动解读文档"""
        doc = await DocumentService.get_document(db, document_id)
        if not doc:
            raise ValueError("文档不存在")

        # 获取公司名
        company_name = "未知公司"
        if doc.company_id:
            company_result = await db.execute(select(Company).where(Company.id == doc.company_id))
            company = company_result.scalar_one_or_none()
            if company:
                company_name = company.name

        # 调用 AI Agent 解读
        agent = AgentFactory.get_document_agent()
        analysis = await agent.analyze_document(
            document_content=doc.content or "",
            document_type=doc.type,
            company_name=company_name,
        )

        # 保存分析结果
        doc.ai_analysis = analysis
        doc.summary = analysis.get("summary")
        await db.flush()

        # 事件分级
        alert_agent = AgentFactory.get_alert_agent()
        classification = await alert_agent.classify(
            content=doc.content or doc.title,
            source=doc.source or "internal",
        )

        # 如果是 P0/P1 级事件，创建预警
        severity = classification.get("severity", "P2")
        if severity in ("P0", "P1"):
            alert = Alert(
                event_type=classification.get("event_type", "unknown"),
                severity=AlertSeverity(severity),
                related_company_ids=[doc.company_id] if doc.company_id else [],
                title=classification.get("title", doc.title),
                summary=classification.get("summary", ""),
                source_document_id=doc.id,
                detail=classification,
                created_by="system",
                updated_by="system",
            )
            db.add(alert)
            await db.flush()

            # 发布预警事件
            event_type = EventTypes.ALERT_P0 if severity == "P0" else EventTypes.ALERT_P1
            await event_bus.publish(event_type, {
                "alert_id": alert.id,
                "severity": severity,
                "title": alert.title,
                "company_ids": alert.related_company_ids,
            })

        # 发布文档已分析事件
        await event_bus.publish(EventTypes.DOCUMENT_ANALYZED, {
            "document_id": doc.id,
            "severity": severity,
            "company_id": doc.company_id,
        })

        return analysis

    @staticmethod
    async def get_company_feed(
        db: AsyncSession,
        company_id: str,
        since: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[Document], int]:
        """获取公司资料流"""
        query = select(Document).where(Document.company_id == company_id)

        if since:
            query = query.where(Document.created_at > since)

        count_result = await db.execute(query)
        total = len(count_result.all())

        query = query.order_by(desc(Document.publish_time)).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)

        return result.scalars().all(), total
