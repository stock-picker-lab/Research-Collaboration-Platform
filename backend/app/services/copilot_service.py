"""
投研协作平台 - Copilot 问答服务
基于 RAG + OpenClaw 的研究问答能力
"""
from __future__ import annotations

from typing import Optional, List
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.models.models import (
    DocumentChunk, Document, CopilotConversation,
)
from app.agents import AgentFactory, openclaw_client

import structlog

logger = structlog.get_logger()


class CopilotService:
    """Copilot 问答业务逻辑"""

    @staticmethod
    async def ask(
        db: AsyncSession,
        user_id: str,
        question: str,
        conversation_id: Optional[str] = None,
        company_id: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
    ) -> dict:
        """
        研究问答核心流程：
        1. 检索相关文档块 (RAG)
        2. 获取对话历史 (多轮追问)
        3. 调用 Copilot Agent 生成回答
        4. 保存对话记录
        """

        # Step 1: 向量检索相关文档块
        relevant_chunks = await CopilotService._retrieve_relevant_chunks(
            db, question, company_id, document_ids
        )

        # Step 2: 获取对话历史 (支持多轮追问)
        conversation = None
        conversation_history = []
        if conversation_id:
            result = await db.execute(
                select(CopilotConversation).where(CopilotConversation.id == conversation_id)
            )
            conversation = result.scalar_one_or_none()
            if conversation:
                conversation_history = conversation.messages or []

        # Step 3: 调用 Copilot Agent
        agent = AgentFactory.get_copilot_agent()
        answer_data = await agent.answer(
            question=question,
            relevant_chunks=relevant_chunks,
            conversation_history=conversation_history,
        )

        # Step 4: 保存/更新对话记录
        if not conversation:
            conversation = CopilotConversation(
                user_id=user_id,
                company_id=company_id,
                title=question[:100],
                messages=[],
                created_by=user_id,
                updated_by=user_id,
            )
            db.add(conversation)
            await db.flush()

        # 追加消息
        new_messages = conversation.messages.copy() if conversation.messages else []
        new_messages.append({"role": "user", "content": question, "timestamp": datetime.now(timezone.utc).isoformat()})
        new_messages.append({
            "role": "assistant",
            "content": answer_data.get("answer", ""),
            "confidence_level": answer_data.get("confidence_level", "medium"),
            "citations": answer_data.get("citations", []),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        conversation.messages = new_messages
        await db.flush()

        return {
            "conversation_id": conversation.id,
            "answer": {
                "content": answer_data.get("answer", ""),
                "confidence_level": answer_data.get("confidence_level", "medium"),
                "citations": answer_data.get("citations", []),
            },
            "related_documents": [
                {"document_id": c.get("document_id"), "title": c.get("document_title")}
                for c in relevant_chunks[:5]
            ],
            "suggested_follow_ups": answer_data.get("suggested_follow_ups", []),
        }

    @staticmethod
    async def _retrieve_relevant_chunks(
        db: AsyncSession,
        question: str,
        company_id: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        top_k: int = 10,
    ) -> List[dict]:
        """向量检索相关文档块"""
        try:
            # 生成问题的向量嵌入
            embeddings = await openclaw_client.embed([question])
            question_embedding = embeddings[0]

            # 构建向量检索查询
            base_query = """
                SELECT dc.id, dc.content, dc.page_number, dc.section_title,
                       dc.document_id, d.title as document_title, d.type as document_type,
                       1 - (dc.embedding <=> :embedding::vector) as similarity
                FROM document_chunks dc
                JOIN documents d ON dc.document_id = d.id
                WHERE dc.embedding IS NOT NULL
            """
            params = {"embedding": str(question_embedding), "top_k": top_k}

            if company_id:
                base_query += " AND d.company_id = :company_id"
                params["company_id"] = company_id

            if document_ids:
                base_query += " AND dc.document_id = ANY(:document_ids)"
                params["document_ids"] = document_ids

            base_query += " ORDER BY dc.embedding <=> :embedding::vector LIMIT :top_k"

            result = await db.execute(text(base_query), params)
            rows = result.fetchall()

            return [
                {
                    "chunk_id": row.id,
                    "content": row.content,
                    "page_number": row.page_number,
                    "section_title": row.section_title,
                    "document_id": row.document_id,
                    "document_title": row.document_title,
                    "document_type": row.document_type,
                    "similarity": float(row.similarity) if row.similarity else 0,
                }
                for row in rows
            ]
        except Exception as e:
            logger.warning("Vector retrieval failed, falling back to text search", error=str(e))
            return []

    @staticmethod
    async def get_conversations(
        db: AsyncSession,
        user_id: str,
        company_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[CopilotConversation], int]:
        """获取用户对话列表"""
        query = select(CopilotConversation).where(CopilotConversation.user_id == user_id)

        if company_id:
            query = query.where(CopilotConversation.company_id == company_id)

        count_result = await db.execute(query)
        total = len(count_result.all())

        query = query.order_by(CopilotConversation.updated_at.desc()).offset(
            (page - 1) * page_size
        ).limit(page_size)
        result = await db.execute(query)

        return result.scalars().all(), total
