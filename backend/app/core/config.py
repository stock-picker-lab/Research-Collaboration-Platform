"""
应用配置
"""
from pydantic_settings import BaseSettings
from typing import Optional, List
import secrets


class Settings(BaseSettings):
    """应用配置"""
    
    # ============================================
    # 基础配置
    # ============================================
    APP_NAME: str = "投研协作平台"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    APP_ENV: str = "production"
    
    # ============================================
    # 安全配置
    # ============================================
    SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    
    # ============================================
    # 数据库配置
    # ============================================
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/research_platform"
    DATABASE_SYNC_URL: str = "postgresql://user:password@localhost:5432/research_platform"
    
    # ============================================
    # Redis配置
    # ============================================
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # ============================================
    # CORS配置
    # ============================================
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # ============================================
    # LLM / AI 配置
    # ============================================
    LLM_API_KEY: Optional[str] = None
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4-turbo"
    
    # 可选的其他LLM提供商
    MOONSHOT_API_KEY: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    
    # ============================================
    # OpenClaw配置 (NEW!)
    # ============================================
    OPENCLAW_BASE_URL: str = "http://openclaw:18789"
    OPENCLAW_API_KEY: str = secrets.token_urlsafe(32)
    OPENCLAW_ENABLED: bool = True
    OPENCLAW_TIMEOUT: int = 300  # 5分钟超时
    
    # ============================================
    # 文件存储配置
    # ============================================
    # MinIO (本地S3)
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "research-docs"
    MINIO_SECURE: bool = False
    
    # 或者使用阿里云OSS
    OSS_ACCESS_KEY: Optional[str] = None
    OSS_SECRET_KEY: Optional[str] = None
    OSS_BUCKET: Optional[str] = None
    OSS_ENDPOINT: Optional[str] = None
    
    # ============================================
    # Celery任务队列 (可选)
    # ============================================
    CELERY_BROKER_URL: str = "redis://redis:6379/3"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/4"
    
    # ============================================
    # 日志配置
    # ============================================
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# 全局配置实例
settings = Settings()
