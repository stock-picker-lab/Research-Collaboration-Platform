"""
投研协作平台 - OpenClaw Agent 定义
基于 OpenClaw 框架的智能体编排
"""
from __future__ import annotations

import json
from typing import Optional, List, Dict, Any

import httpx
from app.core.config import settings

import structlog

logger = structlog.get_logger()


# ============================================
# OpenClaw Client
# ============================================

class OpenClawClient:
    """OpenClaw API 客户端"""

    def __init__(self):
        self.base_url = settings.OPENCLAW_BASE_URL
        self.api_key = settings.OPENCLAW_API_KEY
        self.model = settings.OPENCLAW_MODEL
        self.default_temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS

    def _get_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[dict] = None,
    ) -> dict:
        """调用 OpenClaw LLM 进行对话"""
        payload = {
            "model": self.model,
            "messages": [],
            "temperature": temperature or self.default_temperature,
            "max_tokens": max_tokens or self.max_tokens,
        }

        if system_prompt:
            payload["messages"].append({"role": "system", "content": system_prompt})

        payload["messages"].extend(messages)

        if response_format:
            payload["response_format"] = response_format

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/v1/chat/completions",
                headers=self._get_headers(),
                json=payload,
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]

    async def embed(self, texts: List[str]) -> List[List[float]]:
        """生成文本向量嵌入"""
        payload = {
            "model": settings.EMBEDDING_MODEL,
            "input": texts,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/v1/embeddings",
                headers=self._get_headers(),
                json=payload,
            )
            response.raise_for_status()
            result = response.json()
            return [item["embedding"] for item in result["data"]]


# 全局客户端实例
openclaw_client = OpenClawClient()


# ============================================
# Agent 基础类
# ============================================

class BaseAgent:
    """Agent 基础类"""

    def __init__(self, name: str, system_prompt: str):
        self.name = name
        self.system_prompt = system_prompt
        self.client = openclaw_client

    async def run(self, user_message: str, context: Optional[dict] = None) -> dict:
        """执行 Agent 任务"""
        messages = [{"role": "user", "content": user_message}]

        if context:
            context_str = json.dumps(context, ensure_ascii=False, default=str)
            messages[0]["content"] = f"上下文信息:\n{context_str}\n\n用户问题:\n{user_message}"

        result = await self.client.chat(
            messages=messages,
            system_prompt=self.system_prompt,
        )
        return {"agent": self.name, "response": result.get("content", "")}


# ============================================
# 专用 Agent 定义
# ============================================

class DocumentAnalysisAgent(BaseAgent):
    """文档解读 Agent"""

    def __init__(self):
        super().__init__(
            name="document_analysis",
            system_prompt="""你是一位专业的投研文档分析助手，服务于基金公司研究所。

你的职责是分析财报、公告、会议纪要等投研文档，提取关键信息。

输出格式要求（JSON）：
{
  "summary": {"content": "核心结论摘要", "confidence_level": "high/medium/low"},
  "key_changes": [{"content": "变化点描述", "confidence_level": "..."}],
  "above_expectations": [{"content": "超预期点", "confidence_level": "..."}],
  "below_expectations": [{"content": "低预期点", "confidence_level": "..."}],
  "risk_points": [{"content": "风险点", "confidence_level": "..."}],
  "investment_impact": {"content": "对投资逻辑的影响", "confidence_level": "..."}
}

置信度规则：
- high: 直接引用原文数据或明确表述
- medium: 基于多处间接信息推断
- low: 信息不足或存在矛盾，需人工确认

所有结论必须基于文档原文，不得虚构信息。每个结论需标注对应的原文段落位置。"""
        )

    async def analyze_document(self, document_content: str, document_type: str, company_name: str) -> dict:
        context = {
            "document_type": document_type,
            "company_name": company_name,
        }
        prompt = f"请分析以下{document_type}文档，提取关键信息：\n\n{document_content[:8000]}"
        result = await self.run(prompt, context)

        try:
            parsed = json.loads(result["response"])
            return parsed
        except json.JSONDecodeError:
            return {"summary": {"content": result["response"], "confidence_level": "low"}}


class CopilotAgent(BaseAgent):
    """研究问答 Copilot Agent"""

    def __init__(self):
        super().__init__(
            name="research_copilot",
            system_prompt="""你是投研协作平台的研究问答助手 Copilot，服务于基金公司研究所。

你的职责：
1. 基于提供的知识库内容和文档上下文回答研究问题
2. 所有回答必须附带证据来源引用
3. 明确标注置信度等级
4. 对于无法确认的信息，明确标注为低置信度

输出格式要求（JSON）：
{
  "answer": "回答内容",
  "confidence_level": "high/medium/low",
  "citations": [
    {"document_id": "...", "document_title": "...", "paragraph": "原文引用片段"}
  ],
  "suggested_follow_ups": ["建议追问1", "建议追问2"]
}

重要原则：
- 不可编造不存在的数据或事实
- 对于不确定的推断，标注 confidence_level 为 low
- 如果知识库中没有相关信息，明确告知用户"""
        )

    async def answer(
        self,
        question: str,
        relevant_chunks: List[dict],
        conversation_history: Optional[List[dict]] = None,
    ) -> dict:
        context_text = "\n\n".join([
            f"[文档: {c.get('document_title', '未知')}] {c.get('content', '')}"
            for c in relevant_chunks
        ])

        prompt = f"参考资料：\n{context_text}\n\n问题：{question}"

        if conversation_history:
            history_text = "\n".join([
                f"{'用户' if m['role'] == 'user' else '助手'}: {m['content']}"
                for m in conversation_history[-6:]  # 最近 3 轮
            ])
            prompt = f"对话历史：\n{history_text}\n\n{prompt}"

        result = await self.run(prompt)

        try:
            return json.loads(result["response"])
        except json.JSONDecodeError:
            return {
                "answer": result["response"],
                "confidence_level": "medium",
                "citations": [],
                "suggested_follow_ups": [],
            }


class PeerComparisonAgent(BaseAgent):
    """同行对比 Agent"""

    def __init__(self):
        super().__init__(
            name="peer_comparison",
            system_prompt="""你是投研协作平台的同行对比分析助手。

你的职责：
1. 对比多家公司的关键指标
2. 分析管理层口径差异
3. 识别相对优势/劣势
4. 生成结构化对比结论

输出格式要求（JSON）：
{
  "metric_comparison": [
    {"metric": "指标名", "values": {"公司A": "值", "公司B": "值"}, "insight": "分析"}
  ],
  "management_tone": [
    {"topic": "话题", "differences": "差异描述"}
  ],
  "summary": {
    "content": "综合对比结论",
    "confidence_level": "high/medium/low",
    "advantages": ["优势点"],
    "risks": ["风险点"]
  }
}"""
        )


class AlertClassificationAgent(BaseAgent):
    """事件分级 Agent"""

    def __init__(self):
        super().__init__(
            name="alert_classification",
            system_prompt="""你是投研协作平台的事件分级分析助手。

你的职责是对新入库的资讯/公告进行事件分级和影响评估。

事件分级标准：
- P0 紧急：重大公告（业绩预警、停牌、高管变动）、监管处罚、黑天鹅事件
- P1 重要：财报发布、重要公告、行业政策变化、同行重大事件
- P2 常规：日常新闻、研报更新、例行数据更新

输出格式要求（JSON）：
{
  "severity": "P0/P1/P2",
  "event_type": "事件类型",
  "title": "事件标题",
  "summary": "事件摘要",
  "affected_companies": ["受影响公司"],
  "impact_assessment": "影响评估",
  "recommended_actions": ["建议动作"]
}"""
        )

    async def classify(self, content: str, source: str) -> dict:
        prompt = f"来源: {source}\n\n内容:\n{content[:4000]}\n\n请对此事件进行分级和影响评估。"
        result = await self.run(prompt)

        try:
            return json.loads(result["response"])
        except json.JSONDecodeError:
            return {"severity": "P2", "event_type": "unknown", "title": "未知事件", "summary": result["response"]}


# ============================================
# Agent 工厂
# ============================================

class AgentFactory:
    """Agent 工厂，统一管理所有 Agent 实例"""

    _instances: Dict[str, BaseAgent] = {}

    @classmethod
    def get_document_agent(cls) -> DocumentAnalysisAgent:
        if "document_analysis" not in cls._instances:
            cls._instances["document_analysis"] = DocumentAnalysisAgent()
        return cls._instances["document_analysis"]

    @classmethod
    def get_copilot_agent(cls) -> CopilotAgent:
        if "research_copilot" not in cls._instances:
            cls._instances["research_copilot"] = CopilotAgent()
        return cls._instances["research_copilot"]

    @classmethod
    def get_peer_comparison_agent(cls) -> PeerComparisonAgent:
        if "peer_comparison" not in cls._instances:
            cls._instances["peer_comparison"] = PeerComparisonAgent()
        return cls._instances["peer_comparison"]

    @classmethod
    def get_alert_agent(cls) -> AlertClassificationAgent:
        if "alert_classification" not in cls._instances:
            cls._instances["alert_classification"] = AlertClassificationAgent()
        return cls._instances["alert_classification"]
