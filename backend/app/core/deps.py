"""
依赖注入汇总模块
统一导出常用的 FastAPI 依赖项
"""

from app.core.security import get_current_user  # noqa: F401
from app.core.database import get_db  # noqa: F401
