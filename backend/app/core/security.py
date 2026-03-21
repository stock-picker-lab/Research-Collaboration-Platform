"""
投研协作平台 - 安全认证模块
JWT Token + RBAC 权限控制
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


# --------------- 密码工具 ---------------

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# --------------- JWT 工具 ---------------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌",
        )


# --------------- 依赖注入 ---------------

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """获取当前登录用户"""
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证令牌",
        )
    return {"user_id": user_id, "role": payload.get("role"), "name": payload.get("name")}


class RoleChecker:
    """RBAC 角色检查器"""

    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="权限不足",
            )
        return current_user


def require_role(role: "UserRole") -> RoleChecker:
    """快捷角色检查器，支持传入 UserRole 枚举值"""
    return RoleChecker([role.value])


# 预定义角色检查器
allow_researcher = RoleChecker(["researcher", "admin"])
allow_pm = RoleChecker(["pm", "admin"])
allow_leader = RoleChecker(["leader", "admin"])
allow_admin = RoleChecker(["admin"])
allow_all = RoleChecker(["researcher", "pm", "leader", "admin"])
