# Image Search API (Local - synchronous)
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import base64

from app.core.config_local import get_settings
from app.core.database_local import get_db
from app.core.security import get_current_api_key
from app.models.job import Job, JobType, JobStatus
from app.schemas.osint import (
    JobResponse,
    JobStatusResponse,
)
from app.services.image.searcher import reverse_image_search, download_image

router = APIRouter(prefix="/image", tags=["image"])

settings = get_settings()


@router.post("/search", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
async def search_image(
    background_tasks: BackgroundTasks,
    image_url: str = Form(None),
    file: UploadFile = File(None),
    engines: str = Form(None),
    extract_exif: bool = Form(True),
    extract_faces: bool = Form(True),
    perceptual_hash: bool = Form(True),
    api_key = Depends(get_current_api_key),
    db: AsyncSession = Depends(get_db),
):
    """Start a reverse image search job"""
    if not image_url and not file:
        raise HTTPException(status_code=400, detail="Either image_url or file required")

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

    background_tasks.add_task(run_image_job, str(job.id), job.input_data)

    return job


async def run_image_job(job_id: str, input_data: dict):
    """Run image search synchronously"""
    from app.core.database_local import async_session_maker
    from app.models.job import Job, JobStatus
    from sqlalchemy import select
    import base64

    async with async_session_maker() as db:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            return

        job.status = JobStatus.RUNNING
        await db.commit()

        try:
            image_bytes = None
            if input_data.get("image_base64"):
                image_bytes = base64.b64decode(input_data["image_base64"])
            elif input_data.get("image_url"):
                image_bytes = await download_image(input_data["image_url"])

            result_data = await reverse_image_search(
                image_bytes=image_bytes,
                image_url=input_data.get("image_url"),
                engines=input_data.get("engines"),
                extract_exif_flag=input_data.get("extract_exif", True),
                extract_faces=input_data.get("extract_faces", True),
                perceptual_hash_flag=input_data.get("perceptual_hash", True),
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