# Username Enumeration API
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_api_key
from app.models.job import Job, JobType, JobStatus
from app.schemas.osint import (
    UsernameEnumerateRequest,
    UsernameEnumerateResponse,
    JobCreate,
    JobResponse,
    JobStatusResponse,
)
from app.tasks.username_tasks import enumerate_username_task

router = APIRouter(prefix="/username", tags=["username"])


@router.post("/enumerate", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
async def enumerate_username(
    request: UsernameEnumerateRequest,
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Start a username enumeration job"""
    job = Job(
        api_key_id=api_key.id,
        job_type=JobType.USERNAME,
        status=JobStatus.PENDING,
        input_data=request.model_dump(),
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Queue background task
    enumerate_username_task.delay(str(job.id))

    return job


@router.get("/results/{job_id}", response_model=JobStatusResponse)
async def get_username_results(
    job_id: UUID,
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Get username enumeration results"""
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.api_key_id == api_key.id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.job_type != JobType.USERNAME:
        raise HTTPException(status_code=400, detail="Job is not a username enumeration")

    return JobStatusResponse(
        id=job.id,
        status=job.status,
        progress=job.progress,
        result_data=job.result_data,
        error_message=job.error_message,
    )