"""
投研协作平台 - OpenClaw Agent 定义
基于 OpenClaw 框架的智能体编排
"""
from __future__ import annotations

import json
import asyncio
from typing import Optional, List, Dict, Any, Callable
from enum import Enum
from dataclasses import dataclass, field
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

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
# 多 Agent 协同框架
# ============================================

class TaskStatus(Enum):
    """任务状态"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class AgentTask:
    """Agent 任务"""
    id: str
    agent_name: str
    description: str
    input_data: Dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


@dataclass
class OrchestrationResult:
    """编排结果"""
    task_id: str
    success: bool
    final_result: Dict[str, Any]
    sub_tasks: List[AgentTask]
    execution_time: float
    errors: List[str] = field(default_factory=list)


class BaseAgent:
    """Agent 基础类"""

    def __init__(self, name: str, system_prompt: str, description: str = ""):
        self.name = name
        self.system_prompt = system_prompt
        self.description = description
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

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行任务，子类实现"""
        raise NotImplementedError


# ============================================
# Supervisor Agent - 任务分解与协调
# ============================================

class SupervisorAgent(BaseAgent):
    """Supervisor Agent - 负责任务分解和结果汇总"""

    def __init__(self):
        super().__init__(
            name="supervisor",
            description="任务分解与协调 Agent",
            system_prompt="""你是投研协作平台的 Supervisor Agent，负责协调多个专业 Agent 完成复杂任务。

你的职责：
1. 分析用户请求，确定需要哪些专业 Agent 协同完成
2. 将复杂任务分解为多个子任务
3. 协调各 Agent 的执行顺序和依赖关系
4. 汇总各 Agent 的结果，生成最终报告

可调用的专业 Agent：
- document_analysis: 文档分析 Agent，负责解读财报、公告、纪要等文档
- alert_classification: 事件分级 Agent，负责对资讯/事件进行分级和影响评估
- peer_comparison: 同行对比 Agent，负责对比多家公司的关键指标
- copilot: 研究问答 Agent，负责回答研究问题

任务分解原则：
1. 独立任务可以并行执行
2. 有依赖关系的任务需按顺序执行
3. 优先执行快速任务，让用户尽快看到部分结果

输出格式要求（JSON）：
{
  "task_type": "综合研报生成/事件分析/同行对比/问答",
  "sub_tasks": [
    {
      "agent": "agent_name",
      "description": "任务描述",
      "dependencies": [],  // 依赖的任务 ID 列表
      "input": {}
    }
  ],
  "execution_plan": "执行计划说明",
  "expected_output": "最终输出格式"
}

重要原则：
- 只分解任务，不执行具体分析
- 确保子任务覆盖完整，避免遗漏重要信息
- 考虑任务之间的依赖关系和执行顺序"""
        )

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """分析任务并生成执行计划"""
        user_request = input_data.get("request", "")
        context = input_data.get("context", {})

        prompt = f"请分析以下请求，分解任务并制定执行计划：\n\n请求：{user_request}\n\n上下文：{json.dumps(context, ensure_ascii=False, default=str)}"

        result = await self.run(prompt)
        response_text = result.get("response", "")

        try:
            # 尝试解析 JSON
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0]
            else:
                json_str = response_text

            plan = json.loads(json_str.strip())
            return plan
        except (json.JSONDecodeError, IndexError):
            # 如果无法解析，返回文本结果
            return {
                "task_type": "unknown",
                "execution_plan": response_text,
                "sub_tasks": [],
                "expected_output": ""
            }


# ============================================
# Result Synthesizer - 结果汇总 Agent
# ============================================

class ResultSynthesizerAgent(BaseAgent):
    """结果汇总 Agent - 将多个 Agent 的结果汇总生成最终报告"""

    def __init__(self):
        super().__init__(
            name="result_synthesizer",
            description="结果汇总 Agent",
            system_prompt="""你是投研协作平台的 Result Synthesizer Agent，负责将多个 Agent 的分析结果汇总生成最终报告。

你的职责：
1. 接收各专业 Agent 的分析结果
2. 整合、去重、补充信息
3. 生成结构化的最终报告
4. 标注信息来源和置信度

输出格式要求（JSON）：
{
  "executive_summary": "执行摘要（3-5句话概括核心发现）",
  "key_findings": ["核心发现1", "核心发现2", ...],
  "detailed_analysis": {
    "section_1": {...},
    "section_2": {...}
  },
  "action_items": ["建议动作1", "建议动作2", ...],
  "risks_and_concerns": ["风险点1", "风险点2", ...],
  "confidence_level": "high/medium/low",
  "sources": ["来源1", "来源2", ...],
  "follow_up_suggestions": ["建议追问1", "建议追问2", ...]
}

重要原则：
- 保持客观，不夸大或淡化发现
- 明确标注每个结论的信息来源
- 对于低置信度结论，明确告知用户
- 优先呈现对投资决策有影响的信息"""
        )

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """汇总各 Agent 结果"""
        task_results = input_data.get("task_results", [])
        original_request = input_data.get("request", "")

        # 构建汇总 prompt
        results_text = []
        for tr in task_results:
            agent_name = tr.get("agent", "unknown")
            result_data = tr.get("result", {})
            results_text.append(f"=== {agent_name} ===\n{json.dumps(result_data, ensure_ascii=False, default=str, indent=2)}")

        prompt = f"原始请求：{original_request}\n\n各 Agent 分析结果：\n" + "\n".join(results_text)

        result = await self.run(prompt)
        response_text = result.get("response", "")

        try:
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0]
            else:
                json_str = response_text

            synthesized = json.loads(json_str.strip())
            synthesized["agent_results"] = task_results
            return synthesized
        except (json.JSONDecodeError, IndexError):
            return {
                "executive_summary": response_text,
                "raw_results": task_results,
                "confidence_level": "medium",
                "error": "结果解析失败，请查看 raw_results"
            }


# ============================================
# 专业 Agent 定义
# ============================================

class DocumentAnalysisAgent(BaseAgent):
    """文档解读 Agent"""

    def __init__(self):
        super().__init__(
            name="document_analysis",
            description="文档解读 Agent",
            system_prompt="""你是一位专业的投研文档分析助手，服务于基金公司研究所。

你的职责是分析财报、公告、会议纪要等投研文档，提取关键信息。

输出格式要求（JSON）：
{
  "summary": {"content": "核心结论摘要", "confidence_level": "high/medium/low"},
  "key_changes": [{"content": "变化点描述", "confidence_level": "...", "source": "原文引用"}],
  "above_expectations": [{"content": "超预期点", "confidence_level": "...", "source": "..."}],
  "below_expectations": [{"content": "低预期点", "confidence_level": "...", "source": "..."}],
  "risk_points": [{"content": "风险点", "confidence_level": "...", "source": "..."}],
  "investment_impact": {"content": "对投资逻辑的影响", "confidence_level": "..."}
}

置信度规则：
- high: 直接引用原文数据或明确表述
- medium: 基于多处间接信息推断
- low: 信息不足或存在矛盾，需人工确认

所有结论必须基于文档原文，不得虚构信息。每个结论需标注对应的原文段落位置。"""
        )

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """分析文档"""
        document_content = input_data.get("content", "")
        document_type = input_data.get("type", "未知类型")
        company_name = input_data.get("company_name", "未知公司")

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
            return {
                "summary": {"content": result["response"], "confidence_level": "low"},
                "error": "解析失败"
            }


class CopilotAgent(BaseAgent):
    """研究问答 Copilot Agent"""

    def __init__(self):
        super().__init__(
            name="copilot",
            description="研究问答 Agent",
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

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """回答研究问题"""
        question = input_data.get("question", "")
        relevant_chunks = input_data.get("relevant_chunks", [])
        conversation_history = input_data.get("conversation_history")

        context_text = "\n\n".join([
            f"[文档: {c.get('document_title', '未知')}] {c.get('content', '')}"
            for c in relevant_chunks
        ])

        prompt = f"参考资料：\n{context_text}\n\n问题：{question}"

        if conversation_history:
            history_text = "\n".join([
                f"{'用户' if m['role'] == 'user' else '助手'}: {m['content']}"
                for m in conversation_history[-6:]
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
            description="同行对比 Agent",
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

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """执行同行对比"""
        companies = input_data.get("companies", [])
        metrics = input_data.get("metrics", [])

        companies_text = "\n".join([f"- {c}" for c in companies])
        metrics_text = "\n".join([f"- {m}" for m in metrics])

        prompt = f"请对比以下公司：\n{companies_text}\n\n对比指标：\n{metrics_text}"
        result = await self.run(prompt)

        try:
            return json.loads(result["response"])
        except json.JSONDecodeError:
            return {
                "summary": {"content": result["response"], "confidence_level": "medium"},
                "companies": companies,
                "metrics": metrics
            }


class AlertClassificationAgent(BaseAgent):
    """事件分级 Agent"""

    def __init__(self):
        super().__init__(
            name="alert_classification",
            description="事件分级 Agent",
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

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """分类事件"""
        content = input_data.get("content", "")
        source = input_data.get("source", "未知来源")

        prompt = f"来源: {source}\n\n内容:\n{content[:4000]}\n\n请对此事件进行分级和影响评估。"
        result = await self.run(prompt)

        try:
            return json.loads(result["response"])
        except json.JSONDecodeError:
            return {
                "severity": "P2",
                "event_type": "unknown",
                "title": "未知事件",
                "summary": result["response"]
            }


# ============================================
# Agent Orchestrator - 多 Agent 协同编排器
# ============================================

class AgentOrchestrator:
    """多 Agent 协同编排器"""

    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self._register_default_agents()
        self.supervisor = SupervisorAgent()
        self.synthesizer = ResultSynthesizerAgent()

    def _register_default_agents(self):
        """注册默认 Agent"""
        self.register_agent(DocumentAnalysisAgent())
        self.register_agent(CopilotAgent())
        self.register_agent(PeerComparisonAgent())
        self.register_agent(AlertClassificationAgent())

    def register_agent(self, agent: BaseAgent):
        """注册 Agent"""
        self.agents[agent.name] = agent
        logger.info("agent_registered", agent_name=agent.name, description=agent.description)

    def get_agent(self, name: str) -> Optional[BaseAgent]:
        """获取 Agent"""
        return self.agents.get(name)

    async def execute_task(self, agent_name: str, input_data: Dict[str, Any]) -> AgentTask:
        """执行单个 Agent 任务"""
        task = AgentTask(
            id=f"task_{datetime.utcnow().timestamp()}",
            agent_name=agent_name,
            description=f"执行 {agent_name}",
            input_data=input_data
        )

        agent = self.get_agent(agent_name)
        if not agent:
            task.status = TaskStatus.FAILED
            task.error = f"Agent {agent_name} 不存在"
            return task

        try:
            task.status = TaskStatus.IN_PROGRESS
            logger.info("task_started", task_id=task.id, agent_name=agent_name)

            result = await agent.execute(input_data)
            task.result = result
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.utcnow()

            logger.info("task_completed", task_id=task.id, agent_name=agent_name)

        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            logger.error("task_failed", task_id=task.id, agent_name=agent_name, error=str(e))

        return task

    async def execute_parallel(self, tasks: List[Dict[str, Any]]) -> List[AgentTask]:
        """并行执行多个任务"""
        task_coroutines = [
            self.execute_task(task["agent"], task["input"])
            for task in tasks
        ]
        results = await asyncio.gather(*task_coroutines, return_exceptions=True)

        agent_tasks = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                task = AgentTask(
                    id=f"task_error_{i}",
                    agent_name=tasks[i]["agent"],
                    description=f"执行 {tasks[i]['agent']}",
                    input_data=tasks[i]["input"],
                    status=TaskStatus.FAILED,
                    error=str(result)
                )
                agent_tasks.append(task)
            else:
                agent_tasks.append(result)

        return agent_tasks

    async def orchestrate(self, request: str, context: Optional[Dict[str, Any]] = None) -> OrchestrationResult:
        """
        协调执行复杂任务
        流程：Supervisor 分解 -> 并行执行子任务 -> Synthesizer 汇总
        """
        import time
        start_time = time.time()
        task_id = f"orchestration_{datetime.utcnow().timestamp()}"

        logger.info("orchestration_started", task_id=task_id, request=request)

        # Step 1: Supervisor 分解任务
        supervisor_input = {"request": request, "context": context or {}}
        plan = await self.supervisor.execute(supervisor_input)

        logger.info("task_plan_generated", task_id=task_id, plan=plan)

        # Step 2: 构建依赖图，确定执行顺序
        sub_tasks = plan.get("sub_tasks", [])
        completed_tasks: Dict[str, AgentTask] = {}
        errors = []

        # 按依赖关系分组，相同依赖层级的任务可以并行
        def get_execution_layer(tasks: List[dict]) -> List[List[dict]]:
            """将任务按依赖层级分组"""
            layers = []
            remaining = tasks.copy()
            completed_ids = set()

            while remaining:
                current_layer = []
                next_remaining = []

                for task in remaining:
                    deps = task.get("dependencies", [])
                    if all(dep in completed_ids for dep in deps):
                        current_layer.append(task)
                    else:
                        next_remaining.append(task)

                if not current_layer:
                    # 存在循环依赖，将所有任务放入第一层
                    current_layer = remaining
                    next_remaining = []

                layers.append(current_layer)
                for task in current_layer:
                    completed_ids.add(task.get("id", task.get("agent", "")))
                remaining = next_remaining

            return layers

        execution_layers = get_execution_layer(sub_tasks)

        # Step 3: 按层级执行任务
        all_sub_tasks = []
        for layer in execution_layers:
            layer_tasks = [
                {
                    "agent": task["agent"],
                    "input": task.get("input", {})
                }
                for task in layer
            ]

            # 并行执行当前层级
            layer_results = await self.execute_parallel(layer_tasks)

            # 收集结果，更新 context 供后续任务使用
            for i, sub_task in enumerate(layer_results):
                sub_task.id = layer[i].get("id", f"task_{i}")
                sub_task.description = layer[i].get("description", "")
                all_sub_tasks.append(sub_task)

                if sub_task.status == TaskStatus.FAILED:
                    errors.append(f"{sub_task.agent_name}: {sub_task.error}")
                elif sub_task.result:
                    # 将结果加入 context 供后续任务使用
                    if "context_updates" not in context:
                        context["context_updates"] = {}
                    context["context_updates"][sub_task.agent_name] = sub_task.result

        # Step 4: Synthesizer 汇总结果
        task_results = [
            {
                "agent": st.agent_name,
                "result": st.result,
                "error": st.error,
                "status": st.status.value
            }
            for st in all_sub_tasks
            if st.status == TaskStatus.COMPLETED
        ]

        synthesizer_input = {
            "request": request,
            "task_results": task_results
        }
        final_result = await self.synthesizer.execute(synthesizer_input)

        execution_time = time.time() - start_time

        logger.info(
            "orchestration_completed",
            task_id=task_id,
            execution_time=execution_time,
            sub_tasks_count=len(all_sub_tasks),
            success=len(errors) == 0
        )

        return OrchestrationResult(
            task_id=task_id,
            success=len(errors) == 0,
            final_result=final_result,
            sub_tasks=all_sub_tasks,
            execution_time=execution_time,
            errors=errors
        )

    async def simple_collaborate(
        self,
        agents: List[str],
        input_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        简单协同模式：并行执行多个 Agent，直接返回结果列表
        不经过 Supervisor 分解和 Synthesizer 汇总
        """
        tasks = [{"agent": agent, "input": input_data} for agent in agents]
        results = await self.execute_parallel(tasks)

        return [
            {
                "agent": r.agent_name,
                "result": r.result,
                "status": r.status.value,
                "error": r.error
            }
            for r in results
        ]


# ============================================
# Agent 工厂
# ============================================

class AgentFactory:
    """Agent 工厂，统一管理所有 Agent 实例"""

    _orchestrator: Optional[AgentOrchestrator] = None
    _instances: Dict[str, BaseAgent] = {}

    @classmethod
    def get_orchestrator(cls) -> AgentOrchestrator:
        """获取编排器（单例）"""
        if cls._orchestrator is None:
            cls._orchestrator = AgentOrchestrator()
        return cls._orchestrator

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


# ============================================
# 导出
# ============================================

__all__ = [
    "OpenClawClient",
    "openclaw_client",
    "BaseAgent",
    "SupervisorAgent",
    "ResultSynthesizerAgent",
    "DocumentAnalysisAgent",
    "CopilotAgent",
    "PeerComparisonAgent",
    "AlertClassificationAgent",
    "AgentOrchestrator",
    "AgentFactory",
    "AgentTask",
    "OrchestrationResult",
    "TaskStatus",
]
