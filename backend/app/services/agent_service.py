"""
AI Agent服务 - 业务逻辑层
整合OpenClaw实现多Agent协同
"""
from typing import Optional, Dict, Any, List
from app.agents.openclaw_client import openclaw_client
from app.models.document import Document
from app.models.company import Company
import structlog

logger = structlog.get_logger(__name__)


class AgentService:
    """AI Agent业务服务"""
    
    def __init__(self):
        self.openclaw = openclaw_client
    
    async def check_health(self) -> bool:
        """检查OpenClaw服务状态"""
        return await self.openclaw.health_check()
    
    async def analyze_document(
        self,
        document: Document,
        company: Company,
        analysis_type: str = "detailed"
    ) -> Dict[str, Any]:
        """
        分析研报文档
        
        Args:
            document: 文档对象
            company: 公司对象
            analysis_type: 分析类型(summary/detailed/financial)
        
        Returns:
            {
                "summary": "简短总结",
                "stance": "bullish" | "neutral" | "bearish",
                "target_price": 123.45,
                "key_points": ["要点1", "要点2", "要点3"],
                "financial_metrics": {
                    "revenue": "营收数据",
                    "profit": "利润数据",
                    "pe_ratio": "PE估值"
                },
                "risk_factors": ["风险1", "风险2"],
                "confidence": 0.85
            }
        """
        logger.info(
            "starting_document_analysis",
            document_id=document.id,
            company=company.name
        )
        
        instruction = f"""
请分析以下投研文档,提取核心信息:

公司: {company.name} ({company.ticker})
行业: {company.industry}
板块: {company.sector}
文档标题: {document.title}
文档类型: {document.doc_type}

请以结构化JSON格式提取以下信息:
1. summary: 200字以内的核心总结
2. stance: 投资评级(bullish/neutral/bearish)
3. target_price: 目标价(数字)
4. key_points: 核心观点数组(3-5个要点)
5. financial_metrics: 关键财务指标(JSON对象)
6. risk_factors: 风险因素数组
7. confidence: 分析置信度(0-1之间)

返回格式必须是有效的JSON,不要包含其他文本。
"""
        
        context = {
            "document_id": document.id,
            "document_title": document.title,
            "document_type": document.doc_type,
            "document_content": document.summary or "",  # 使用summary字段
            "company_info": {
                "id": company.id,
                "name": company.name,
                "ticker": company.ticker,
                "industry": company.industry,
                "sector": company.sector,
                "description": company.description
            },
            "analysis_type": analysis_type
        }
        
        try:
            # 创建任务
            task = await self.openclaw.create_task(
                instruction=instruction,
                context=context,
                agent_type="research",
                model="openai/gpt-4-turbo",
                temperature=0.3
            )
            
            # 等待任务完成
            result = await self.openclaw.wait_for_task(
                task_id=task["task_id"],
                timeout=300,  # 5分钟超时
                poll_interval=5
            )
            
            logger.info(
                "document_analysis_completed",
                document_id=document.id,
                result_keys=list(result.keys()) if isinstance(result, dict) else None
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "document_analysis_failed",
                document_id=document.id,
                error=str(e)
            )
            raise
    
    async def answer_question(
        self,
        question: str,
        company: Company,
        relevant_docs: Optional[List[Document]] = None
    ) -> Dict[str, Any]:
        """
        回答基金经理问题(RAG检索)
        
        Args:
            question: 用户问题
            company: 公司对象
            relevant_docs: 相关文档列表(如已检索)
        
        Returns:
            {
                "answer": "详细回答",
                "sources": [
                    {"doc_id": 123, "title": "xxx", "relevance": 0.92}
                ],
                "confidence": 0.85
            }
        """
        logger.info(
            "starting_question_answering",
            company=company.name,
            question_length=len(question)
        )
        
        instruction = f"""
请回答关于 {company.name} ({company.ticker}) 的投资问题:

问题: {question}

要求:
1. 基于提供的研报文档进行回答
2. 回答要专业、准确
3. 明确标注信息来源
4. 如果文档中没有相关信息,请说明
5. 以JSON格式返回: {{"answer": "...", "confidence": 0.8}}
"""
        
        # 准备文档上下文
        docs_context = []
        if relevant_docs:
            for doc in relevant_docs[:5]:  # 最多5篇
                docs_context.append({
                    "id": doc.id,
                    "title": doc.title,
                    "type": doc.doc_type,
                    "content": doc.summary[:2000] if doc.summary else "",
                    "created_at": doc.created_at.isoformat() if doc.created_at else None
                })
        
        context = {
            "company_id": company.id,
            "company_name": company.name,
            "company_ticker": company.ticker,
            "question": question,
            "documents": docs_context
        }
        
        try:
            task = await self.openclaw.create_task(
                instruction=instruction,
                context=context,
                agent_type="qa",
                model="openai/gpt-4-turbo",
                temperature=0.2  # 问答任务用较低温度
            )
            
            result = await self.openclaw.wait_for_task(
                task_id=task["task_id"],
                timeout=180  # 3分钟超时
            )
            
            # 添加来源信息
            if "sources" not in result and relevant_docs:
                result["sources"] = [
                    {
                        "doc_id": doc.id,
                        "title": doc.title,
                        "relevance": 1.0 / (i + 1)  # 简单的相关性评分
                    }
                    for i, doc in enumerate(relevant_docs[:3])
                ]
            
            logger.info("question_answered", company=company.name)
            
            return result
            
        except Exception as e:
            logger.error(
                "question_answering_failed",
                company=company.name,
                error=str(e)
            )
            raise
    
    async def generate_risk_alert(
        self,
        company: Company,
        holding_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        生成持仓风险预警
        
        Args:
            company: 公司对象
            holding_info: 持仓信息 {weight, avg_cost, current_price, pnl_ratio}
        
        Returns:
            {
                "risk_level": "high" | "medium" | "low",
                "risk_factors": [...],
                "suggested_actions": [...],
                "analysis": "详细分析"
            }
        """
        logger.info(
            "starting_risk_analysis",
            company=company.name,
            weight=holding_info.get("weight")
        )
        
        instruction = f"""
请为持仓公司 {company.name} ({company.ticker}) 生成风险预警分析:

持仓信息:
- 持仓权重: {holding_info.get('weight', 0)}%
- 持仓成本: {holding_info.get('avg_cost')}元
- 当前价格: {holding_info.get('current_price')}元
- 浮动盈亏: {holding_info.get('pnl_ratio', 0)}%

请分析以下维度:
1. 公司基本面变化
2. 行业环境变化
3. 市场舆情风险
4. 财务指标预警
5. 建议操作

以JSON格式返回:
{{
    "risk_level": "high/medium/low",
    "risk_factors": ["风险1", "风险2"],
    "suggested_actions": ["建议1", "建议2"],
    "analysis": "详细分析文本"
}}
"""
        
        context = {
            "company": {
                "id": company.id,
                "name": company.name,
                "ticker": company.ticker,
                "industry": company.industry,
                "sector": company.sector
            },
            "holding": holding_info
        }
        
        try:
            task = await self.openclaw.create_task(
                instruction=instruction,
                context=context,
                agent_type="risk",
                model="openai/gpt-4-turbo",
                temperature=0.3
            )
            
            result = await self.openclaw.wait_for_task(
                task_id=task["task_id"],
                timeout=240  # 4分钟超时
            )
            
            logger.info("risk_analysis_completed", company=company.name)
            
            return result
            
        except Exception as e:
            logger.error(
                "risk_analysis_failed",
                company=company.name,
                error=str(e)
            )
            raise
    
    async def generate_insight(
        self,
        company: Company,
        time_range: str = "recent"
    ) -> Dict[str, Any]:
        """
        生成投资洞察
        
        Args:
            company: 公司对象
            time_range: 时间范围(recent/quarter/year)
        
        Returns:
            {
                "summary": "洞察总结",
                "trends": [...],
                "opportunities": [...],
                "concerns": [...]
            }
        """
        logger.info("starting_insight_generation", company=company.name)
        
        instruction = f"""
请为 {company.name} ({company.ticker}) 生成投资洞察报告:

分析时间范围: {time_range}

请分析:
1. 核心趋势
2. 投资机会
3. 需要关注的问题
4. 市场情绪变化

以JSON格式返回分析结果。
"""
        
        context = {
            "company": {
                "id": company.id,
                "name": company.name,
                "ticker": company.ticker,
                "industry": company.industry
            },
            "time_range": time_range
        }
        
        try:
            task = await self.openclaw.create_task(
                instruction=instruction,
                context=context,
                agent_type="insight",
                model="openai/gpt-4-turbo"
            )
            
            result = await self.openclaw.wait_for_task(task_id=task["task_id"])
            
            logger.info("insight_generated", company=company.name)
            
            return result
            
        except Exception as e:
            logger.error("insight_generation_failed", company=company.name, error=str(e))
            raise


# 单例实例
agent_service = AgentService()
