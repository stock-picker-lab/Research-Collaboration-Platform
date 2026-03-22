"""
Agent 执行历史 API 路由
查询和管理 AI Agent 执行历史记录
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from pydantic import BaseModel

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.services.history_service import agent_history_service

router = APIRouter()


# ==================== Response Models ====================

class HistoryItem(BaseModel):
    id: int
    agent_type: str
    request_data: dict
    response_data: Optional[dict]
    status: str
    error_message: Optional[str]
    execution_time_ms: Optional[int]
    created_at: str


class HistoryListResponse(BaseModel):
    histories: List[HistoryItem]
    total: int


class StatisticsResponse(BaseModel):
    total_executions: int
    success_count: int
    failed_count: int
    success_rate: float
    by_agent_type: dict
    avg_execution_time_ms: float


# ==================== API Endpoints ====================

@router.get("/", response_model=HistoryListResponse)
async def get_history_list(
    agent_type: Optional[str] = Query(None, description="Agent类型过滤"),
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取当前用户的Agent执行历史
    
    支持按Agent类型过滤
    """
    try:
        histories = await agent_history_service.get_user_history(
            user_id=current_user.id,
            agent_type=agent_type,
            limit=limit,
            db=db
        )
        
        return HistoryListResponse(
            histories=[HistoryItem(**h) for h in histories],
            total=len(histories)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取历史记录失败: {str(e)}"
        )


@router.get("/statistics", response_model=StatisticsResponse)
async def get_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取当前用户的Agent使用统计
    
    包括总执行次数、成功率、各类型分布等
    """
    try:
        stats = await agent_history_service.get_statistics(
            user_id=current_user.id,
            db=db
        )
        
        return StatisticsResponse(**stats)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取统计数据失败: {str(e)}"
        )


@router.get("/{history_id}")
async def get_history_detail(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取单条历史记录的详细信息
    """
    try:
        history = await agent_history_service.get_history_by_id(
            history_id=history_id,
            db=db
        )
        
        if not history:
            raise HTTPException(status_code=404, detail="历史记录不存在")
        
        # 权限检查
        if history.get('user_id') != current_user.id and current_user.role != 'admin':
            raise HTTPException(status_code=403, detail="无权访问此历史记录")
        
        return history
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"获取历史记录失败: {str(e)}"
        )
