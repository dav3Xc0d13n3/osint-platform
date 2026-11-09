# Core Configuration
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # App
    APP_NAME: str = "OSINT Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Redis
    REDIS_URL: str
    REDIS_DB: int = 0

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    API_KEY_HEADER: str = "X-API-Key"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Rate Limiting
    DEFAULT_RATE_LIMIT: str = "100/minute"
    USERNAME_CONCURRENCY: int = 50
    IMAGE_CONCURRENCY: int = 10
    LINK_CONCURRENCY: int = 20

    # External APIs
    GOOGLE_API_KEY: str | None = None
    GOOGLE_CSE_ID: str | None = None
    YANDEX_API_KEY: str | None = None
    TINEYE_API_KEY: str | None = None
    BING_API_KEY: str | None = None
    VIRUSTOTAL_API_KEY: str | None = None
    URLHAUS_API_KEY: str | None = None
    ALIENVAULT_API_KEY: str | None = None

    # Celery
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None

    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/gif"]

    # Timeouts
    HTTP_TIMEOUT: int = 30
    JOB_TIMEOUT: int = 300  # 5 minutes


@lru_cache
def get_settings() -> Settings:
    return Settings()