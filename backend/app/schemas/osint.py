# Pydantic Schemas
from datetime import datetime
from typing import Optional, Any, List
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl
from enum import Enum


class JobType(str, Enum):
    USERNAME = "username"
    IMAGE = "image"
    LINK = "link"


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


# Username Enumeration
class UsernameEnumerateRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    platforms: Optional[List[str]] = None  # None = all
    timeout: int = Field(default=30, ge=5, le=120)


class PlatformResult(BaseModel):
    platform: str
    url: str
    exists: bool
    status_code: Optional[int] = None
    response_time: Optional[float] = None
    error: Optional[str] = None


class UsernameEnumerateResponse(BaseModel):
    username: str
    total_platforms: int
    found: int
    not_found: int
    errors: int
    results: List[PlatformResult]
    elapsed_time: float


# Image Search
class ImageSearchRequest(BaseModel):
    image_url: Optional[HttpUrl] = None
    # file upload handled separately
    engines: Optional[List[str]] = None  # google, yandex, tineye, bing
    extract_exif: bool = True
    extract_faces: bool = True
    perceptual_hash: bool = True


class ExifData(BaseModel):
    gps: Optional[dict] = None
    camera: Optional[dict] = None
    datetime: Optional[str] = None
    software: Optional[str] = None
    raw: dict = {}


class FaceMatch(BaseModel):
    platform: str
    profile_url: str
    confidence: float
    thumbnail: Optional[str] = None


class ImageSearchResult(BaseModel):
    source_url: Optional[str] = None
    exif: Optional[ExifData] = None
    perceptual_hash: Optional[str] = None
    face_embeddings: Optional[List[List[float]]] = None
    engine_results: dict = {}  # engine -> list of results
    face_matches: List[FaceMatch] = []


# Link Analysis
class LinkAnalyzeRequest(BaseModel):
    url: HttpUrl
    expand_shorteners: bool = True
    follow_redirects: bool = True
    extract_metadata: bool = True
    check_ssl: bool = True
    enumerate_subdomains: bool = True
    check_archives: bool = True
    threat_intel: bool = True


class RedirectHop(BaseModel):
    url: str
    status_code: int
    headers: dict
    latency: float


class MetadataResult(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    type: Optional[str] = None
    site_name: Optional[str] = None
    twitter_card: Optional[dict] = None
    json_ld: List[dict] = []


class SSLInfo(BaseModel):
    valid: bool
    issuer: Optional[str] = None
    subject: Optional[str] = None
    not_before: Optional[str] = None
    not_after: Optional[str] = None
    san: List[str] = []
    fingerprint: Optional[str] = None


class ThreatIntelResult(BaseModel):
    source: str
    malicious: bool
    categories: List[str] = []
    details: dict = {}


class LinkAnalyzeResult(BaseModel):
    original_url: str
    final_url: str
    redirect_chain: List[RedirectHop] = []
    metadata: Optional[MetadataResult] = None
    ssl: Optional[SSLInfo] = None
    subdomains: List[str] = []
    archive_snapshots: List[str] = []
    threat_intel: List[ThreatIntelResult] = []


# Generic Job
class JobCreate(BaseModel):
    job_type: JobType
    input_data: dict


class JobResponse(BaseModel):
    id: UUID
    job_type: JobType
    status: JobStatus
    input_data: dict
    result_data: Optional[dict] = None
    error_message: Optional[str] = None
    progress: int
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JobStatusResponse(BaseModel):
    id: UUID
    status: JobStatus
    progress: int
    result_data: Optional[dict] = None
    error_message: Optional[str] = None


# API Key
class APIKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    rate_limit: str = "100/minute"
    expires_in_days: Optional[int] = None


class APIKeyResponse(BaseModel):
    id: UUID
    name: str
    key_prefix: str
    plain_key: Optional[str] = None  # Only on creation
    is_active: bool
    rate_limit: str
    expires_at: Optional[datetime] = None
    created_at: datetime
    last_used: Optional[datetime] = None

    class Config:
        from_attributes = True