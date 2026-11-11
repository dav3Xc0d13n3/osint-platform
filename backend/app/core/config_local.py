# Local Configuration (SQLite + in-memory)
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env.local", case_sensitive=True)

    # App
    APP_NAME: str = "OSINT Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Database - SQLite for local
    DATABASE_URL: str = "sqlite+aiosqlite:///./osint_local.db"

    # Security
    SECRET_KEY: str = "dev-local-secret-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    API_KEY_HEADER: str = "X-API-Key"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000"]

    # Rate Limiting (in-memory)
    DEFAULT_RATE_LIMIT: str = "100/minute"
    USERNAME_CONCURRENCY: int = 20
    IMAGE_CONCURRENCY: int = 5
    LINK_CONCURRENCY: int = 10

    # External APIs (optional)
    GOOGLE_API_KEY: str | None = None
    GOOGLE_CSE_ID: str | None = None
    YANDEX_API_KEY: str | None = None
    TINEYE_API_KEY: str | None = None
    BING_API_KEY: str | None = None
    VIRUSTOTAL_API_KEY: str | None = None
    URLHAUS_API_KEY: str | None = None
    ALIENVAULT_API_KEY: str | None = None

    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/gif"]

    # Timeouts
    HTTP_TIMEOUT: int = 30
    JOB_TIMEOUT: int = 300


@lru_cache
def get_settings() -> Settings:
    return Settings()