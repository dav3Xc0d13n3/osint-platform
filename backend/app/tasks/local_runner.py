# Local Task Runner - runs async tasks in BackgroundTasks (no Celery needed)
from app.tasks.username_tasks import run_username_job
from app.tasks.image_tasks import run_image_job
from app.tasks.link_tasks import run_link_job


def run_username_job_bg(job_id: str):
    """Run username enumeration job in background"""
    import asyncio
    asyncio.create_task(run_username_job(job_id))


def run_image_job_bg(job_id: str):
    """Run image search job in background"""
    import asyncio
    asyncio.create_task(run_image_job(job_id))


def run_link_job_bg(job_id: str):
    """Run link analysis job in background"""
    import asyncio
    asyncio.create_task(run_link_job(job_id))