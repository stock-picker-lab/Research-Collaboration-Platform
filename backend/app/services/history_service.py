"""
Agent 执行历史记录服务
记录和查询 AI Agent 的执行历史
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc
from datetime import datetime
from typing import Optional, List, Dict, Any
import json

from app.models.user import User


# TODO: 创建 AgentHistory 数据库模型
# 当前使用简化的内存存储作为占位符

class InMemoryHistoryStore:
    """内存中的历史记录存储(占位符)"""
    _store: List[Dict[str, Any]] = []
    _next_id: int = 1
    
    @classmethod
    def add(cls, record: Dict[str, Any]) -> int:
        record['id'] = cls._next_id
        record['created_at'] = datetime.utcnow().isoformat()
        cls._store.append(record)
        cls._next_id += 1
        return record['id']
    
    @classmethod
    def get_by_user(cls, user_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        return [r for r in reversed(cls._store) if r.get('user_id') == user_id][:limit]
    
    @classmethod
    def get_by_id(cls, history_id: int) -> Optional[Dict[str, Any]]:
        for record in cls._store:
            if record['id'] == history_id:
                return record
        return None
    
    @classmethod
    def clear(cls):
        cls._store = []
        cls._next_id = 1


class AgentHistoryService:
    """Agent 执行历史服务"""
    
    async def record_execution(
        self,
        user_id: int,
        agent_type: str,
        request_data: Dict[str, Any],
        response_data: Optional[Dict[str, Any]],
        status: str,
        error_message: Optional[str] = None,
        execution_time_ms: Optional[int] = None
    ) -> int:
        """
        记录 Agent 执行历史
        
        Args:
            user_id: 用户ID
            agent_type: Agent类型 (analyze_document/ask_question/risk_monitor/generate_insight)
            request_data: 请求参数
            response_data: 响应数据
            status: 执行状态 (success/failed/timeout)
            error_message: 错误信息(如果失败)
            execution_time_ms: 执行时间(毫秒)
        
        Returns:
            历史记录ID
        """
        record = {
            'user_id': user_id,
            'agent_type': agent_type,
            'request_data': request_data,
            'response_data': response_data,
            'status': status,
            'error_message': error_message,
            'execution_time_ms': execution_time_ms
        }
        
        # TODO: 保存到数据库
        # 当前使用内存存储
        history_id = InMemoryHistoryStore.add(record)
        return history_id
    
    async def get_user_history(
        self,
        user_id: int,
        agent_type: Optional[str] = None,
        limit: int = 50,
        db: Optional[AsyncSession] = None
    ) -> List[Dict[str, Any]]:
        """
        获取用户的执行历史
        
        Args:
            user_id: 用户ID
            agent_type: Agent类型过滤(可选)
            limit: 返回数量限制
            db: 数据库会话
        
        Returns:
            历史记录列表
        """
        # TODO: 从数据库查询
        # 当前使用内存存储
        records = InMemoryHistoryStore.get_by_user(user_id, limit)
        
        if agent_type:
            records = [r for r in records if r.get('agent_type') == agent_type]
        
        return records
    
    async def get_history_by_id(
        self,
        history_id: int,
        db: Optional[AsyncSession] = None
    ) -> Optional[Dict[str, Any]]:
        """
        获取单条历史记录
        
        Args:
            history_id: 历史记录ID
            db: 数据库会话
        
        Returns:
            历史记录详情
        """
        # TODO: 从数据库查询
        return InMemoryHistoryStore.get_by_id(history_id)
    
    async def get_statistics(
        self,
        user_id: int,
        db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        获取用户的Agent使用统计
        
        Args:
            user_id: 用户ID
            db: 数据库会话
        
        Returns:
            统计数据
        """
        records = await self.get_user_history(user_id, db=db)
        
        total = len(records)
        success = len([r for r in records if r.get('status') == 'success'])
        failed = len([r for r in records if r.get('status') == 'failed'])
        
        # 按类型统计
        by_type = {}
        for record in records:
            agent_type = record.get('agent_type', 'unknown')
            by_type[agent_type] = by_type.get(agent_type, 0) + 1
        
        # 平均执行时间
        execution_times = [
            r.get('execution_time_ms', 0) 
            for r in records 
            if r.get('execution_time_ms')
        ]
        avg_execution_time = sum(execution_times) / len(execution_times) if execution_times else 0
        
        return {
            'total_executions': total,
            'success_count': success,
            'failed_count': failed,
            'success_rate': (success / total * 100) if total > 0 else 0,
            'by_agent_type': by_type,
            'avg_execution_time_ms': round(avg_execution_time, 2)
        }


# 全局单例
agent_history_service = AgentHistoryService()
