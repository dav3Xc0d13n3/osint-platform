# Admin Authentication API
from datetime import datetime, timedelta, UTC
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    get_current_admin,
)
from app.models.admin import AdminUser
from app.schemas.osint import APIKeyCreate, APIKeyResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login")
async def admin_login(
    username: str,
    password: str,
    db: AsyncSession = Depends(get_db),
):
    """Admin login with username and password"""
    result = await db.execute(select(AdminUser).where(AdminUser.username == username))
    admin = result.scalar_one_or_none()
    
    if not admin or not verify_password(password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account is inactive",
        )
    
    # Update last login
    admin.last_login = datetime.now(UTC)
    await db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=60 * 24 * 7)  # 7 days
    access_token = create_access_token(
        data={"sub": str(admin.id), "username": admin.username, "is_superuser": admin.is_superuser},
        expires_delta=access_token_expires,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "admin": {
            "id": str(admin.id),
            "username": admin.username,
            "email": admin.email,
            "full_name": admin.full_name,
            "is_superuser": admin.is_superuser,
        }
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def admin_register(
    username: str,
    email: str,
    password: str,
    full_name: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Register first admin user (only works if no admins exist)"""
    result = await db.execute(select(AdminUser))
    existing = result.scalars().all()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin registration disabled: admin users already exist",
        )
    
    # Check if username or email already exists
    result = await db.execute(select(AdminUser).where(AdminUser.username == username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    result = await db.execute(select(AdminUser).where(AdminUser.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = hash_password(password)
    admin = AdminUser(
        username=username,
        email=email,
        password_hash=hashed_password,
        full_name=full_name,
        is_superuser=True,  # First admin is superuser
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    
    return {
        "id": str(admin.id),
        "username": admin.username,
        "email": admin.email,
        "full_name": admin.full_name,
        "is_superuser": admin.is_superuser,
        "created_at": admin.created_at,
    }


@router.get("/me")
async def admin_me(
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Get current admin user info"""
    return {
        "id": str(current_admin.id),
        "username": current_admin.username,
        "email": current_admin.email,
        "full_name": current_admin.full_name,
        "is_superuser": current_admin.is_superuser,
        "is_active": current_admin.is_active,
        "last_login": current_admin.last_login,
        "created_at": current_admin.created_at,
    }


@router.post("/create-user")
async def admin_create_user(
    username: str,
    email: str,
    password: str,
    full_name: str | None = None,
    is_superuser: bool = False,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new admin user (superuser only)"""
    if not current_admin.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can create admin users",
        )
    
    result = await db.execute(select(AdminUser).where(AdminUser.username == username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    
    result = await db.execute(select(AdminUser).where(AdminUser.email == email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = hash_password(password)
    admin = AdminUser(
        username=username,
        email=email,
        password_hash=hashed_password,
        full_name=full_name,
        is_superuser=is_superuser,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    
    return {
        "id": str(admin.id),
        "username": admin.username,
        "email": admin.email,
        "full_name": admin.full_name,
        "is_superuser": admin.is_superuser,
        "is_active": admin.is_active,
        "created_at": admin.created_at,
    }


@router.get("/users")
async def admin_list_users(
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all admin users (superuser only)"""
    if not current_admin.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can list admin users",
        )
    
    result = await db.execute(select(AdminUser).order_by(AdminUser.created_at.desc()))
    admins = result.scalars().all()
    
    return [
        {
            "id": str(a.id),
            "username": a.username,
            "email": a.email,
            "full_name": a.full_name,
            "is_superuser": a.is_superuser,
            "is_active": a.is_active,
            "last_login": a.last_login,
            "created_at": a.created_at,
        }
        for a in admins
    ]


@router.patch("/users/{user_id}/toggle-active")
async def admin_toggle_user_active(
    user_id: str,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Toggle admin user active status (superuser only)"""
    if not current_admin.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superusers can toggle admin users",
        )
    
    result = await db.execute(select(AdminUser).where(AdminUser.id == user_id))
    admin = result.scalar_one_or_none()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found",
        )
    
    if admin.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate yourself",
        )
    
    admin.is_active = not admin.is_active
    await db.commit()
    await db.refresh(admin)
    
    return {
        "id": str(admin.id),
        "username": admin.username,
        "is_active": admin.is_active,
    }


@router.post("/create-api-key", response_model=APIKeyResponse)
async def admin_create_api_key(
    request: APIKeyCreate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create API key as admin (for users)"""
    from app.core.security import generate_api_key
    from datetime import datetime, timedelta, UTC
    
    plain_key, hashed_key = generate_api_key()
    expires_at = None
    if request.expires_in_days:
        expires_at = datetime.now(UTC) + timedelta(days=request.expires_in_days)
    
    new_key = APIKey(
        name=request.name,
        key_hash=hashed_key,
        key_prefix=plain_key[:12],
        rate_limit=request.rate_limit,
        expires_at=expires_at,
    )
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)
    
    return APIKeyResponse(
        id=new_key.id,
        name=new_key.name,
        key_prefix=new_key.key_prefix,
        plain_key=plain_key,
        is_active=new_key.is_active,
        rate_limit=new_key.rate_limit,
        expires_at=new_key.expires_at,
        created_at=new_key.created_at,
        last_used=new_key.last_used,
    )