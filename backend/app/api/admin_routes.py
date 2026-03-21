"""
管理员 API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.models import User, UserRole, DataSource, AuditLog

router = APIRouter(prefix="/admin", tags=["系统管理"])


@router.get("/stats")
async def get_admin_stats(
    current_user: dict = Depends(lambda: require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    """获取系统统计"""
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar()
    researcher_count = (await db.execute(select(func.count()).select_from(User).where(User.role == UserRole.researcher))).scalar()
    pm_count = (await db.execute(select(func.count()).select_from(User).where(User.role == UserRole.pm))).scalar()
    leader_count = (await db.execute(select(func.count()).select_from(User).where(User.role == UserRole.leader))).scalar()

    return {
        "total_users": total_users,
        "researcher_count": researcher_count,
        "pm_count": pm_count,
        "leader_count": leader_count,
        "system_status": {
            "uptime": "99.9",
            "api_calls": 12345,
            "errors": 2,
        },
    }


# User management
user_mgmt_router = APIRouter(prefix="/users", tags=["用户管理"])


@user_mgmt_router.get("")
async def get_all_users(
    page: int = 1,
    page_size: int = 20,
    role: Optional[str] = None,
    current_user: dict = Depends(lambda: require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    """获取所有用户"""
    query = select(User)
    if role:
        query = query.where(User.role == UserRole(role))

    total = (await db.execute(select(func.count()).select_from(User))).scalar()
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    users = result.scalars().all()

    return {
        "items": [
            {
                "id": u.id,
                "username": u.username,
                "name": u.name,
                "email": u.email,
                "role": u.role.value,
                "title": u.title,
                "team": u.team,
                "is_active": u.is_active,
                "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@user_mgmt_router.post("")
async def admin_create_user(
    data: dict,
    current_user: dict = Depends(lambda: require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    """管理员创建用户"""
    from app.core.security import get_password_hash

    user = User(
        username=data["username"],
        email=data["email"],
        hashed_password=get_password_hash(data["password"]),
        name=data["name"],
        role=UserRole(data["role"]),
        title=data.get("title"),
        team=data.get("team"),
    )
    db.add(user)
    await db.flush()
    await db.commit()
    return {"id": user.id}


@user_mgmt_router.put("/{user_id}")
async def admin_update_user(
    user_id: str,
    data: dict,
    current_user: dict = Depends(lambda: require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    """管理员更新用户"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    for key, value in data.items():
        if hasattr(user, key) and key not in ("id", "hashed_password"):
            setattr(user, key, value)

    await db.commit()
    return {"id": user.id}


@user_mgmt_router.post("/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    current_user: dict = Depends(lambda: require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    """切换用户状态"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    user.is_active = not user.is_active
    await db.commit()
    return {"is_active": user.is_active}


# Audit logs
audit_router = APIRouter(prefix="/audit-logs", tags=["审计日志"])


@audit_router.get("")
async def get_audit_logs(
    page: int = 1,
    page_size: int = 50,
    action: Optional[str] = None,
    current_user: dict = Depends(lambda: require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    """获取审计日志"""
    query = select(AuditLog)
    if action:
        query = query.where(AuditLog.action == action)

    total = (await db.execute(select(func.count()).select_from(AuditLog))).scalar()
    query = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    logs = result.scalars().all()

    return {
        "items": [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "object_type": log.object_type,
                "object_id": log.object_id,
                "details": log.details,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# Data sources
datasource_router = APIRouter(prefix="/data-sources", tags=["数据源管理"])


@datasource_router.get("")
async def get_data_sources(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取数据源列表"""
    result = await db.execute(select(DataSource))
    sources = result.scalars().all()

    return {
        "items": [
            {
                "id": s.id,
                "name": s.name,
                "type": s.type,
                "config": s.config,
                "status": s.status.value,
                "sync_frequency": s.sync_frequency,
                "last_sync_at": s.last_sync_at.isoformat() if s.last_sync_at else None,
                "last_error": s.last_error,
                "created_at": s.created_at.isoformat(),
            }
            for s in sources
        ],
        "total": len(sources),
    }


@datasource_router.post("")
async def create_data_source(
    data: dict,
    current_user: dict = Depends(lambda: require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    """创建数据源"""
    source = DataSource(
        name=data["name"],
        type=data["type"],
        config=data.get("config", {}),
        sync_frequency=data.get("sync_frequency"),
        status="active",
    )
    db.add(source)
    await db.flush()
    await db.commit()
    return {"id": source.id}


@datasource_router.post("/{source_id}/sync")
async def sync_data_source(
    source_id: str,
    current_user: dict = Depends(lambda: require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    """同步数据源"""
    result = await db.execute(select(DataSource).where(DataSource.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="数据源不存在")

    # Simulate sync
    source.last_sync_at = func.now()
    await db.commit()
    return {"success": True}
