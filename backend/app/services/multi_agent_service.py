"""
投研协作平台 - 多 Agent 协同服务
基于 OpenClaw Agent Orchestrator 的复杂任务处理
"""
from __future__ import annotations

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text

from app.models.models import (
    DocumentChunk, Document, CopilotConversation,
    Company,
)
from app.agents import AgentOrchestrator, AgentFactory, AgentTask, TaskStatus
from app.services.copilot_service import CopilotService

import structlog

logger = structlog.get_logger()


class MultiAgentCollaborationService:
    """多 Agent 协同服务"""

    @staticmethod
    async def comprehensive_research(
        db: AsyncSession,
        user_id: str,
        company_id: str,
        focus_areas: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        综合研报生成 - 多 Agent 协同示例

        流程：
        1. 获取公司信息
        2. 并行执行：文档分析 + 事件分类 + 同行对比（如有）
        3. Synthesizer 汇总生成综合研报
        """
        orchestrator = AgentFactory.get_orchestrator()

        # Step 1: 获取公司信息
        company_result = await db.execute(select(Company).where(Company.id == company_id))
        company = company_result.scalar_one_or_none()

        if not company:
            return {"error": "公司不存在"}

        # Step 2: 获取相关文档
        docs_result = await db.execute(
            select(Document).where(Document.company_id == company_id).limit(5)
        )
        documents = docs_result.scalars().all()

        # Step 3: 构建协同任务
        context = {
            "company_id": company_id,
            "company_name": company.name,
            "focus_areas": focus_areas or ["财务分析", "业务发展", "风险评估"],
        }

        # 并行执行多个 Agent
        agents_input = {
            "company_name": company.name,
            "documents": [
                {
                    "title": doc.title,
                    "type": doc.type.value if hasattr(doc.type, 'value') else str(doc.type),
                    "summary": doc.summary or "",
                }
                for doc in documents
            ]
        }

        # 简单协同模式：并行执行文档分析、事件分类等
        agent_names = ["document_analysis", "alert_classification"]
        results = await orchestrator.simple_collaborate(agent_names, agents_input)

        # Step 4: 使用编排器生成综合报告
        request = f"请基于以下信息，为{company.name}生成综合研报分析：\n\n公司：{company.name}\n关注领域：{', '.join(focus_areas or [])}"
        orchestration_result = await orchestrator.orchestrate(request, context)

        return {
            "company_id": company_id,
            "company_name": company.name,
            "orchestration_id": orchestration_result.task_id,
            "execution_time": orchestration_result.execution_time,
            "success": orchestration_result.success,
            "errors": orchestration_result.errors,
            "final_report": orchestration_result.final_result,
            "agent_results": [
                {
                    "agent": st.agent_name,
                    "status": st.status.value,
                    "result": st.result,
                }
                for st in orchestration_result.sub_tasks
            ],
        }

    @staticmethod
    async def event_analysis(
        db: AsyncSession,
        user_id: str,
        content: str,
        source: str,
        company_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        事件分析 - 多 Agent 协同

        流程：
        1. AlertClassificationAgent 分级
        2. DocumentAnalysisAgent 分析影响
        3. Synthesizer 汇总
        """
        orchestrator = AgentFactory.get_orchestrator()

        # Step 1: 事件分级
        alert_agent = AgentFactory.get_alert_agent()
        alert_result = await alert_agent.execute({
            "content": content,
            "source": source,
        })

        # Step 2: 获取关联公司文档（如有）
        related_docs = []
        if company_id:
            docs_result = await db.execute(
                select(Document).where(Document.company_id == company_id).limit(3)
            )
            related_docs = [
                {
                    "title": doc.title,
                    "content": doc.summary or "",
                    "type": doc.type.value if hasattr(doc.type, 'value') else str(doc.type),
                }
                for doc in docs_result.scalars().all()
            ]

        # Step 3: 文档分析（如有相关文档）
        doc_analysis_result = None
        if related_docs:
            doc_agent = AgentFactory.get_document_agent()
            doc_analysis_result = await doc_agent.execute({
                "content": "\n".join([d.get("content", "") for d in related_docs]),
                "type": "综合分析",
                "company_name": company_id,
            })

        # Step 4: Synthesizer 汇总
        synthesizer = orchestrator.synthesizer
        synthesis_result = await synthesizer.execute({
            "request": f"请分析以下事件：\n{content}",
            "task_results": [
                {"agent": "alert_classification", "result": alert_result},
                {"agent": "document_analysis", "result": doc_analysis_result} if doc_analysis_result else None,
            ],
        })

        return {
            "severity": alert_result.get("severity", "P2"),
            "event_type": alert_result.get("event_type", "unknown"),
            "impact_assessment": alert_result.get("impact_assessment", ""),
            "synthesized_report": synthesis_result,
            "related_documents": len(related_docs),
        }

    @staticmethod
    async def peer_comparison_analysis(
        db: AsyncSession,
        user_id: str,
        company_ids: List[str],
        metrics: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        同行对比分析 - 多 Agent 协同
        """
        orchestrator = AgentFactory.get_orchestrator()

        # Step 1: 获取公司信息
        companies = []
        for cid in company_ids:
            result = await db.execute(select(Company).where(Company.id == cid))
            company = result.scalar_one_or_none()
            if company:
                companies.append({
                    "id": company.id,
                    "name": company.name,
                    "industry": company.industry,
                    "market_cap": str(company.market_cap) if company.market_cap else "未知",
                })

        # Step 2: 获取各公司最新文档
        company_docs = {}
        for cid in company_ids:
            docs_result = await db.execute(
                select(Document).where(Document.company_id == cid).limit(3)
            )
            company_docs[cid] = [
                {"title": doc.title, "summary": doc.summary or ""}
                for doc in docs_result.scalars().all()
            ]

        # Step 3: 执行同行对比
        peer_agent = AgentFactory.get_peer_comparison_agent()
        default_metrics = metrics or [
            "营收增长率", "毛利率", "净利润率", "ROE",
            "资产负债率", "经营活动现金流"
        ]

        comparison_result = await peer_agent.execute({
            "companies": [c["name"] for c in companies],
            "metrics": default_metrics,
        })

        # Step 4: 文档分析（可选）
        doc_agent = AgentFactory.get_document_agent()
        all_docs_summary = []
        for cid, docs in company_docs.items():
            for doc in docs:
                if doc.get("summary"):
                    all_docs_summary.append(f"[{cid}] {doc['summary']}")

        doc_analysis = None
        if all_docs_summary:
            doc_analysis = await doc_agent.execute({
                "content": "\n".join(all_docs_summary),
                "type": "同行对比分析",
                "company_name": "多家公司",
            })

        return {
            "companies": companies,
            "metrics": default_metrics,
            "comparison": comparison_result,
            "document_analysis": doc_analysis,
        }

    @staticmethod
    async def research_qa_with_context(
        db: AsyncSession,
        user_id: str,
        question: str,
        company_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        带上下文的研究问答 - 利用多 Agent 增强

        流程：
        1. CopilotAgent 基于向量检索回答
        2. AlertClassificationAgent 检查是否需要预警
        3. Synthesizer 整合置信度和来源
        """
        orchestrator = AgentFactory.get_orchestrator()

        # Step 1: RAG 检索相关文档
        relevant_chunks = await CopilotService._retrieve_relevant_chunks(
            db, question, company_id, None, top_k=5
        )

        # Step 2: CopilotAgent 回答
        copilot_agent = AgentFactory.get_copilot_agent()

        # 获取对话历史
        conversation_history = None
        if conversation_id:
            result = await db.execute(
                select(CopilotConversation).where(CopilotConversation.id == conversation_id)
            )
            conversation = result.scalar_one_or_none()
            if conversation and conversation.messages:
                conversation_history = conversation.messages[-6:]  # 最近 3 轮

        qa_result = await copilot_agent.execute({
            "question": question,
            "relevant_chunks": relevant_chunks,
            "conversation_history": conversation_history,
        })

        # Step 3: 检查是否涉及需要预警的内容
        alert_result = None
        if relevant_chunks:
            # 提取相关内容用于预警判断
            content_snippets = [c.get("content", "")[:500] for c in relevant_chunks[:3]]
            combined_content = "\n".join(content_snippets)

            alert_agent = AgentFactory.get_alert_agent()
            alert_result = await alert_agent.execute({
                "content": f"问题：{question}\n相关文档内容：{combined_content}",
                "source": "研报问答系统",
            })

        # Step 4: 保存对话
        if not conversation_id:
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
        new_messages.append({
            "role": "user",
            "content": question,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        new_messages.append({
            "role": "assistant",
            "content": qa_result.get("answer", ""),
            "confidence_level": qa_result.get("confidence_level", "medium"),
            "citations": qa_result.get("citations", []),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        conversation.messages = new_messages
        await db.commit()

        return {
            "conversation_id": conversation.id,
            "answer": qa_result.get("answer", ""),
            "confidence_level": qa_result.get("confidence_level", "medium"),
            "citations": qa_result.get("citations", []),
            "suggested_follow_ups": qa_result.get("suggested_follow_ups", []),
            "alert_triggered": alert_result.get("severity") in ["P0", "P1"] if alert_result else False,
            "alert_info": alert_result if alert_result else None,
            "related_documents": [
                {
                    "document_id": c.get("document_id"),
                    "title": c.get("document_title"),
                    "similarity": c.get("similarity", 0),
                }
                for c in relevant_chunks[:5]
            ],
        }


# 全局实例
multi_agent_service = MultiAgentCollaborationService()
