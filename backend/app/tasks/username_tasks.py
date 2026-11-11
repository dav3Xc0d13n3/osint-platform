# Username Enumeration Tasks (local runner compatible)
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
import asyncio

from app.core.config import get_settings
from app.models.job import Job, JobStatus
from app.services.username.enumerator import enumerate_username

settings = get_settings()

# Create async engine for tasks
task_engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
TaskSession = async_sessionmaker(task_engine, expire_on_commit=False)


async def run_username_job(job_id: str):
    """Run username enumeration job (called via BackgroundTasks)"""
    await _enumerate_username_async(job_id)


async def _enumerate_username_async(job_id: str):
    async with TaskSession() as db:
        # Get job
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            return {"error": "Job not found"}

        # Update status to running
        job.status = JobStatus.RUNNING
        job.started_at = asyncio.get_event_loop().time()
        await db.commit()

        try:
            input_data = job.input_data
            username = input_data.get("username")
            platforms = input_data.get("platforms")
            timeout = input_data.get("timeout", 30)

            # Run enumeration
            result_data = await enumerate_username(
                username=username,
                platforms=platforms,
                timeout=timeout,
                concurrency=settings.USERNAME_CONCURRENCY,
            )

            # Update job with results
            job.status = JobStatus.COMPLETED
            job.result_data = result_data
            job.progress = 100
            job.completed_at = asyncio.get_event_loop().time()
            await db.commit()

            return result_data

        except Exception as e:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            job.completed_at = asyncio.get_event_loop().time()
            await db.commit()
            raise