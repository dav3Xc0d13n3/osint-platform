# Link Analysis API
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_api_key
from app.models.job import Job, JobType, JobStatus
from app.schemas.osint import (
    LinkAnalyzeRequest,
    JobResponse,
    JobStatusResponse,
)
from app.tasks.local_runner import run_link_job_bg

router = APIRouter(prefix="/link", tags=["link"])


@router.post("/analyze", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
async def analyze_link(
    request: LinkAnalyzeRequest,
    background_tasks: BackgroundTasks,
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Start a link analysis job"""
    job = Job(
        api_key_id=api_key.id,
        job_type=JobType.LINK,
        status=JobStatus.PENDING,
        input_data=request.model_dump(),
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Queue background task (no Celery)
    background_tasks.add_task(run_link_job_bg, str(job.id))

    return job


@router.get("/results/{job_id}", response_model=JobStatusResponse)
async def get_link_results(
    job_id: UUID,
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Get link analysis results"""
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.api_key_id == api_key.id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.job_type != JobType.LINK:
        raise HTTPException(status_code=400, detail="Job is not a link analysis")

    return JobStatusResponse(
        id=job.id,
        status=job.status,
        progress=job.progress,
        result_data=job.result_data,
        error_message=job.error_message,
    )