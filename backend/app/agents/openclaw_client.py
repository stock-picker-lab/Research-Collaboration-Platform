"""
OpenClaw HTTP客户端 - 与OpenClaw Gateway通信
"""
import httpx
from typing import Optional, Dict, Any, AsyncIterator
from app.core.config import settings
import structlog
import json
import asyncio

logger = structlog.get_logger(__name__)


class OpenClawClient:
    """OpenClaw Gateway HTTP客户端"""
    
    def __init__(
        self,
        base_url: str = "http://openclaw:18789",
        api_key: Optional[str] = None,
        timeout: float = 300.0
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or getattr(settings, 'OPENCLAW_API_KEY', None)
        self.timeout = timeout
        
        headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=httpx.Timeout(timeout),
            headers=headers
        )
    
    async def health_check(self) -> bool:
        """
        检查OpenClaw服务健康状态
        
        Returns:
            True if healthy, False otherwise
        """
        try:
            response = await self.client.get("/health")
            return response.status_code == 200
        except Exception as e:
            logger.warning("openclaw_health_check_failed", error=str(e))
            return False
    
    async def create_task(
        self,
        instruction: str,
        context: Optional[Dict[str, Any]] = None,
        agent_type: str = "default",
        model: str = "openai/gpt-4-turbo",
        temperature: float = 0.3
    ) -> Dict[str, Any]:
        """
        创建新的Agent任务
        
        Args:
            instruction: 任务指令(自然语言)
            context: 上下文信息(公司信息、文档内容等)
            agent_type: Agent类型(research/qa/risk/insight)
            model: LLM模型名称
            temperature: 温度参数
        
        Returns:
            {
                "task_id": "uuid",
                "status": "pending",
                "created_at": "2026-03-22T10:00:00Z"
            }
        """
        payload = {
            "instruction": instruction,
            "context": context or {},
            "agent_type": agent_type,
            "settings": {
                "model": model,
                "temperature": temperature,
                "max_tokens": 4000
            }
        }
        
        try:
            response = await self.client.post("/api/v1/tasks", json=payload)
            response.raise_for_status()
            result = response.json()
            
            logger.info(
                "openclaw_task_created",
                task_id=result.get("task_id"),
                agent_type=agent_type
            )
            
            return result
            
        except httpx.HTTPError as e:
            logger.error("openclaw_task_creation_failed", error=str(e))
            raise
    
    async def get_task_result(self, task_id: str) -> Dict[str, Any]:
        """
        获取任务结果
        
        Returns:
            {
                "task_id": "uuid",
                "status": "completed" | "pending" | "failed",
                "result": {...},
                "error": "...",
                "duration": 5.2
            }
        """
        try:
            response = await self.client.get(f"/api/v1/tasks/{task_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error("openclaw_task_fetch_failed", task_id=task_id, error=str(e))
            raise
    
    async def wait_for_task(
        self,
        task_id: str,
        timeout: int = 300,
        poll_interval: int = 5
    ) -> Dict[str, Any]:
        """
        等待任务完成
        
        Args:
            task_id: 任务ID
            timeout: 超时时间(秒)
            poll_interval: 轮询间隔(秒)
        
        Returns:
            任务结果
        
        Raises:
            TimeoutError: 任务超时
            Exception: 任务执行失败
        """
        max_retries = timeout // poll_interval
        
        for attempt in range(max_retries):
            result = await self.get_task_result(task_id)
            
            status = result.get("status")
            
            if status == "completed":
                logger.info("openclaw_task_completed", task_id=task_id, duration=result.get("duration"))
                return result.get("result", {})
            
            elif status == "failed":
                error_msg = result.get("error", "Unknown error")
                logger.error("openclaw_task_failed", task_id=task_id, error=error_msg)
                raise Exception(f"OpenClaw任务失败: {error_msg}")
            
            # 任务仍在进行中
            await asyncio.sleep(poll_interval)
        
        logger.error("openclaw_task_timeout", task_id=task_id, timeout=timeout)
        raise TimeoutError(f"OpenClaw任务 {task_id} 超时({timeout}秒)")
    
    async def stream_task(
        self,
        instruction: str,
        context: Optional[Dict[str, Any]] = None,
        agent_type: str = "default"
    ) -> AsyncIterator[Dict[str, Any]]:
        """
        流式执行任务(SSE)
        
        Args:
            instruction: 任务指令
            context: 上下文信息
            agent_type: Agent类型
        
        Yields:
            {"type": "progress", "message": "正在分析文档..."}
            {"type": "result", "data": {...}}
            {"type": "complete"}
        """
        payload = {
            "instruction": instruction,
            "context": context or {},
            "agent_type": agent_type,
            "stream": True
        }
        
        try:
            async with self.client.stream("POST", "/api/v1/tasks/stream", json=payload) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]  # 去掉 "data: " 前缀
                        if data_str.strip():
                            try:
                                data = json.loads(data_str)
                                yield data
                            except json.JSONDecodeError:
                                logger.warning("openclaw_stream_invalid_json", line=data_str)
                                
        except httpx.HTTPError as e:
            logger.error("openclaw_stream_failed", error=str(e))
            raise
    
    async def execute_skill(
        self,
        skill_name: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        执行OpenClaw技能
        
        Args:
            skill_name: 技能名称(document-analysis/web-search/data-extraction)
            parameters: 技能参数
        
        Returns:
            技能执行结果
        """
        payload = {
            "skill": skill_name,
            "parameters": parameters
        }
        
        try:
            response = await self.client.post("/api/v1/skills/execute", json=payload)
            response.raise_for_status()
            result = response.json()
            
            logger.info("openclaw_skill_executed", skill=skill_name, success=result.get("success"))
            
            return result
            
        except httpx.HTTPError as e:
            logger.error("openclaw_skill_execution_failed", skill=skill_name, error=str(e))
            raise
    
    async def close(self):
        """关闭HTTP客户端"""
        await self.client.aclose()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()


# 单例实例
_openclaw_client = None


def get_openclaw_client() -> OpenClawClient:
    """获取OpenClaw客户端单例"""
    global _openclaw_client
    if _openclaw_client is None:
        base_url = getattr(settings, 'OPENCLAW_BASE_URL', 'http://openclaw:18789')
        _openclaw_client = OpenClawClient(base_url=base_url)
    return _openclaw_client


# 便捷的快捷方式
openclaw_client = get_openclaw_client()
