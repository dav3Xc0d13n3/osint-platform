# Link Analysis API (Local - synchronous)
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database_local import get_db
from app.core.security import get_current_api_key
from app.models.job import Job, JobType, JobStatus
from app.schemas.osint import (
    LinkAnalyzeRequest,
    JobResponse,
    JobStatusResponse,
)
from app.services.link.analyzer import analyze_link

router = APIRouter(prefix="/link", tags=["link"])


@router.post("/analyze", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
async def analyze_link_endpoint(
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

    background_tasks.add_task(run_link_job, str(job.id), request.model_dump())

    return job


async def run_link_job(job_id: str, input_data: dict):
    """Run link analysis synchronously"""
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
            result_data = await analyze_link(
                url=input_data.get("url"),
                expand_shorteners=input_data.get("expand_shorteners", True),
                follow_redirects_flag=input_data.get("follow_redirects", True),
                extract_metadata_flag=input_data.get("extract_metadata", True),
                check_ssl_flag=input_data.get("check_ssl", True),
                enumerate_subdomains_flag=input_data.get("enumerate_subdomains", True),
                check_archives_flag=input_data.get("check_archives", True),
                threat_intel_flag=input_data.get("threat_intel", True),
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