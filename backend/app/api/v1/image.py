# Image Search API
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import base64

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import get_current_api_key
from app.models.job import Job, JobType, JobStatus
from app.schemas.osint import (
    ImageSearchRequest,
    JobResponse,
    JobStatusResponse,
)
from app.tasks.local_runner import run_image_job_bg

router = APIRouter(prefix="/image", tags=["image"])

settings = get_settings()


@router.post("/search", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
async def search_image(
    image_url: str = Form(None),
    file: UploadFile = File(None),
    engines: str = Form(None),  # comma-separated
    extract_exif: bool = Form(True),
    extract_faces: bool = Form(True),
    perceptual_hash: bool = Form(True),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Start a reverse image search job"""
    if not image_url and not file:
        raise HTTPException(status_code=400, detail="Either image_url or file required")

    # Validate file
    image_base64 = None
    if file:
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(status_code=400, detail="Invalid file type")
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="File too large")
        image_base64 = base64.b64encode(content).decode()

    engine_list = None
    if engines:
        engine_list = [e.strip() for e in engines.split(",")]

    job = Job(
        api_key_id=api_key.id,
        job_type=JobType.IMAGE,
        status=JobStatus.PENDING,
        input_data={
            "image_url": image_url,
            "image_base64": image_base64,
            "engines": engine_list,
            "extract_exif": extract_exif,
            "extract_faces": extract_faces,
            "perceptual_hash": perceptual_hash,
        },
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Queue background task (no Celery)
    background_tasks.add_task(run_image_job_bg, str(job.id))

    return job


@router.get("/results/{job_id}", response_model=JobStatusResponse)
async def get_image_results(
    job_id: UUID,
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Get reverse image search results"""
    result = await db.execute(
        select(Job).where(Job.id == job_id, Job.api_key_id == api_key.id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.job_type != JobType.IMAGE:
        raise HTTPException(status_code=400, detail="Job is not an image search")

    return JobStatusResponse(
        id=job.id,
        status=job.status,
        progress=job.progress,
        result_data=job.result_data,
        error_message=job.error_message,
    )