# Image Search Tasks
from celery import shared_task
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
import asyncio
import base64

from app.core.config import get_settings
from app.models.job import Job, JobStatus
from app.services.image.searcher import reverse_image_search, download_image

settings = get_settings()

task_engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
TaskSession = async_sessionmaker(task_engine, expire_on_commit=False)


@shared_task(bind=True, max_retries=3)
def image_search_task(self, job_id: str):
    return asyncio.run(_image_search_async(job_id))


async def _image_search_async(job_id: str):
    async with TaskSession() as db:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            return {"error": "Job not found"}

        job.status = JobStatus.RUNNING
        await db.commit()

        try:
            input_data = job.input_data
            image_url = input_data.get("image_url")
            image_base64 = input_data.get("image_base64")
            engines = input_data.get("engines")
            extract_exif = input_data.get("extract_exif", True)
            extract_faces = input_data.get("extract_faces", True)
            perceptual_hash = input_data.get("perceptual_hash", True)

            # Get image bytes
            if image_base64:
                image_bytes = base64.b64decode(image_base64)
            elif image_url:
                image_bytes = await download_image(image_url)
            else:
                raise ValueError("No image provided")

            # Run search
            result_data = await reverse_image_search(
                image_bytes=image_bytes,
                image_url=image_url,
                engines=engines,
                extract_exif_flag=extract_exif,
                extract_faces=extract_faces,
                perceptual_hash_flag=perceptual_hash,
            )

            job.status = JobStatus.COMPLETED
            job.result_data = result_data
            job.progress = 100
            await db.commit()

            return result_data

        except Exception as e:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            await db.commit()
            raise