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
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # security.py 引用
    
    # ============================================
    # 数据库配置
    # ============================================
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/research_platform"
    DATABASE_SYNC_URL: str = "postgresql://user:password@localhost:5432/research_platform"
    DB_ECHO: bool = False  # SQLAlchemy echo (SQL日志)
    
    # ============================================
    # Redis配置
    # ============================================
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_EVENT_BUS_DB: int = 1  # 事件总线专用 Redis DB
    
    # ============================================
    # CORS配置
    # ============================================
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    @property
    def cors_origins_list(self) -> List[str]:
        """兼容 main.py 中 settings.cors_origins_list 的调用"""
        return self.CORS_ORIGINS
    
    # ============================================
    # LLM / AI 配置
    # ============================================
    LLM_API_KEY: Optional[str] = None
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4-turbo"
    LLM_TEMPERATURE: float = 0.7  # 默认温度
    LLM_MAX_TOKENS: int = 4096  # 默认最大token数
    
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
    OPENCLAW_MODEL: str = "gpt-4-turbo"  # OpenClaw使用的模型
    
    # ============================================
    # 向量嵌入模型配置
    # ============================================
    EMBEDDING_MODEL: str = "text-embedding-ada-002"
    
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
    # SMTP邮件配置 (可选)
    # ============================================
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # ============================================
    # IM Webhook 配置 (可选)
    # ============================================
    WECHAT_WORK_WEBHOOK_URL: Optional[str] = None
    WECHAT_WORK_CORP_ID: Optional[str] = None
    WECHAT_WORK_AGENT_SECRET: Optional[str] = None
    DINGTALK_WEBHOOK_URL: Optional[str] = None
    DINGTALK_ACCESS_TOKEN: Optional[str] = None
    DINGTALK_SECRET: Optional[str] = None
    FEISHU_WEBHOOK_URL: Optional[str] = None
    FEISHU_APP_ID: Optional[str] = None
    FEISHU_APP_SECRET: Optional[str] = None
    SLACK_WEBHOOK_URL: Optional[str] = None
    SLACK_BOT_TOKEN: Optional[str] = None
    IM_INTEGRATION_ENABLED: bool = False
    
    # ============================================
    # 日志配置
    # ============================================
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# 全局配置实例
settings = Settings()
