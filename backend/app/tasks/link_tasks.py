# Link Analysis Tasks
from celery import shared_task
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select
import asyncio

from app.core.config import get_settings
from app.models.job import Job, JobStatus
from app.services.link.analyzer import analyze_link

settings = get_settings()

task_engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
TaskSession = async_sessionmaker(task_engine, expire_on_commit=False)


@shared_task(bind=True, max_retries=3)
def link_analyze_task(self, job_id: str):
    return asyncio.run(_link_analyze_async(job_id))


async def _link_analyze_async(job_id: str):
    async with TaskSession() as db:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if not job:
            return {"error": "Job not found"}

        job.status = JobStatus.RUNNING
        await db.commit()

        try:
            input_data = job.input_data
            url = input_data.get("url")

            result_data = await analyze_link(
                url=url,
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

            return result_data

        except Exception as e:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            await db.commit()
            raise