# Security & Authentication
from datetime import datetime, timedelta, UTC
from typing import Optional
from uuid import uuid4

from fastapi import Depends, Header, HTTPException, Request, status
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.models.api_key import APIKey

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.JWTError:
        return None


def hash_api_key(key: str) -> str:
    return pwd_context.hash(key)


def verify_api_key(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def generate_api_key() -> tuple[str, str]:
    """Returns (plain_key, hashed_key)"""
    plain = f"osint_{uuid4().hex[:32]}"
    return plain, hash_api_key(plain)


async def get_current_api_key(
    request: Request,
    api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
) -> APIKey:
    result = await db.execute(select(APIKey).where(APIKey.is_active == True))
    keys = result.scalars().all()

    for key in keys:
        if verify_api_key(api_key, key.key_hash):
            if key.expires_at and key.expires_at < datetime.now(UTC):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="API key expired",
                )
            key.last_used = datetime.now(UTC)
            await db.commit()
            return key

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid API key",
    )


async def get_optional_api_key(
    request: Request,
    api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
) -> Optional[APIKey]:
    if not api_key:
        return None
    try:
        return await get_current_api_key(request, api_key, db)
    except HTTPException:
        return None