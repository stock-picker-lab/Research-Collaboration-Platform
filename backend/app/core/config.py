"""
投研协作平台 - 核心配置
"""
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # App
    APP_NAME: str = "investment-research-platform"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-this-to-a-secure-random-string"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/research_platform"
    DATABASE_SYNC_URL: str = "postgresql://postgres:postgres@localhost:5432/research_platform"
    DB_ECHO: bool = False

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_EVENT_BUS_DB: int = 1
    REDIS_CACHE_DB: int = 2

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "research-documents"
    MINIO_USE_SSL: bool = False

    # JWT
    JWT_SECRET_KEY: str = "change-this-to-a-secure-random-string"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # OpenClaw / AI
    OPENCLAW_API_KEY: str = ""
    OPENCLAW_MODEL: str = "claude-opus-4-6"
    OPENCLAW_BASE_URL: str = "http://localhost:8080"
    LLM_PROVIDER: str = "openclaw"
    LLM_MODEL: str = "claude-opus-4-6"
    LLM_TEMPERATURE: float = 0.1
    LLM_MAX_TOKENS: int = 4096
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/3"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/4"

    # SMTP
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # WeChat Work
    WECOM_WEBHOOK_URL: str = ""

    # Logging
    LOG_LEVEL: str = "INFO"

    # CORS
    CORS_ORIGINS: str = '["http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
