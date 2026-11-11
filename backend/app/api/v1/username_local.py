# Username Enumeration API (Local - synchronous)
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database_local import get_db
from app.core.security import get_current_api_key
from app.models.job import Job, JobType, JobStatus
from app.schemas.osint import (
    UsernameEnumerateRequest,
    JobResponse,
    JobStatusResponse,
)
from app.services.username.enumerator import enumerate_username

router = APIRouter(prefix="/username", tags=["username"])


@router.post("/enumerate", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
async def enumerate_username_endpoint(
    request: UsernameEnumerateRequest,
    background_tasks: BackgroundTasks,
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

    # Run in background
    background_tasks.add_task(run_username_job, str(job.id), request.model_dump())

    return job


async def run_username_job(job_id: str, input_data: dict):
    """Run username enumeration synchronously"""
    from app.core.database_local import async_session_maker
    from app.models.job import Job, JobStatus
    from sqlalchemy import select

    async with async_session_maker() as db:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            return

        job.status = JobStatus.RUNNING
        await db.commit()

        try:
            result_data = await enumerate_username(
                username=input_data.get("username"),
                platforms=input_data.get("platforms"),
                timeout=input_data.get("timeout", 30),
                concurrency=20,
            )

            job.status = JobStatus.COMPLETED
            job.result_data = result_data
            job.progress = 100
            await db.commit()
        except Exception as e:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            await db.commit()


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