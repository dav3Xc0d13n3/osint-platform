# Local API v1 Router
from fastapi import APIRouter

from app.api.v1 import username_local, image_local, link_local, jobs_local

api_router = APIRouter()

api_router.include_router(username_local.router, prefix="/username", tags=["username"])
api_router.include_router(image_local.router, prefix="/image", tags=["image"])
api_router.include_router(link_local.router, prefix="/link", tags=["link"])
api_router.include_router(jobs_local.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(jobs_local.keys_router, prefix="/keys", tags=["keys"])