# API v1 Router
from fastapi import APIRouter

from app.api.v1 import username, image, link, jobs

api_router = APIRouter()

api_router.include_router(username.router, prefix="/username", tags=["username"])
api_router.include_router(image.router, prefix="/image", tags=["image"])
api_router.include_router(link.router, prefix="/link", tags=["link"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(jobs.keys_router, prefix="/keys", tags=["keys"])