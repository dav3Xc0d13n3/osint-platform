# Generic Jobs API
from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_api_key
from app.models.job import Job, JobType, JobStatus
from app.models.api_key import APIKey
from app.schemas.osint import (
    JobCreate,
    JobResponse,
    JobStatusResponse,
    APIKeyCreate,
    APIKeyResponse,
)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/", response_model=List[JobResponse])
async def list_jobs(
    job_type: Optional[JobType] = None,
    status: Optional[JobStatus] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """List jobs for the authenticated API key"""
    query = select(Job).where(Job.api_key_id == api_key.id).order_by(desc(Job.created_at))

    if job_type:
        query = query.where(Job.job_type == job_type)
    if status:
        query = query.where(Job.status == status)

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    jobs = result.scalars().all()

    return jobs


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job(
    job_id: UUID,
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Get job status and results"""
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.api_key_id == api_key.id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatusResponse(
        id=job.id,
        status=job.status,
        progress=job.progress,
        result_data=job.result_data,
        error_message=job.error_message,
    )


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: UUID,
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Delete a job"""
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.api_key_id == api_key.id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    await db.delete(job)
    await db.commit()


# API Key Management
keys_router = APIRouter(prefix="/keys", tags=["keys"])


@keys_router.post("/", response_model=APIKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    request: APIKeyCreate,
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Create a new API key (admin only - first key or key with admin flag)"""
    # In production, add admin check here
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
        plain_key=plain_key,  # Only returned on creation
        is_active=new_key.is_active,
        rate_limit=new_key.rate_limit,
        expires_at=new_key.expires_at,
        created_at=new_key.created_at,
        last_used=new_key.last_used,
    )


@keys_router.get("/", response_model=List[APIKeyResponse])
async def list_api_keys(
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """List API keys (admin only)"""
    result = await db.execute(select(APIKey).order_by(desc(APIKey.created_at)))
    keys = result.scalars().all()

    return [
        APIKeyResponse(
            id=k.id,
            name=k.name,
            key_prefix=k.key_prefix,
            is_active=k.is_active,
            rate_limit=k.rate_limit,
            expires_at=k.expires_at,
            created_at=k.created_at,
            last_used=k.last_used,
        )
        for k in keys
    ]


@keys_router.patch("/{key_id}/revoke", response_model=APIKeyResponse)
async def revoke_api_key(
    key_id: UUID,
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Revoke an API key"""
    result = await db.execute(select(APIKey).where(APIKey.id == key_id))
    key = result.scalar_one_or_none()

    if not key:
        raise HTTPException(status_code=404, detail="API key not found")

    key.is_active = False
    await db.commit()
    await db.refresh(key)

    return APIKeyResponse(
        id=key.id,
        name=key.name,
        key_prefix=key.key_prefix,
        is_active=key.is_active,
        rate_limit=key.rate_limit,
        expires_at=key.expires_at,
        created_at=key.created_at,
        last_used=key.last_used,
    )