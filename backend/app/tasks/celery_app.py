# Celery Configuration
from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "osint_platform",
    broker=settings.CELERY_BROKER_URL or settings.REDIS_URL,
    backend=settings.CELERY_RESULT_BACKEND or settings.REDIS_URL,
    include=[
        "app.tasks.username_tasks",
        "app.tasks.image_tasks",
        "app.tasks.link_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=settings.JOB_TIMEOUT,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
)