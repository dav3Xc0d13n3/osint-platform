# Image Search Service
import io
import hashlib
from typing import Optional, List, Dict, Any
from dataclasses import dataclass

import httpx
from PIL import Image, ExifTags
import imagehash
import exifread
import numpy as np

from app.core.config import get_settings

settings = get_settings()


@dataclass
class ExifData:
    gps: Optional[Dict] = None
    camera: Optional[Dict] = None
    datetime: Optional[str] = None
    software: Optional[str] = None
    raw: Dict = None


async def download_image(url: str, timeout: int = 30) -> bytes:
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.content


def extract_exif(image_bytes: bytes) -> ExifData:
    exif_data = ExifData(raw={})

    # Using exifread for comprehensive EXIF
    f = io.BytesIO(image_bytes)
    tags = exifread.process_file(f, details=False)

    gps_data = {}
    camera_data = {}

    for tag, value in tags.items():
        tag_str = str(tag)
        value_str = str(value)
        exif_data.raw[tag_str] = value_str

        # GPS
        if "GPS" in tag_str:
            gps_data[tag_str] = value_str
        # Camera info
        elif any(k in tag_str for k in ["Make", "Model", "Lens", "FocalLength", "Exposure", "ISO", "Aperture"]):
            camera_data[tag_str] = value_str
        # DateTime
        elif "DateTime" in tag_str and not exif_data.datetime:
            exif_data.datetime = value_str
        # Software
        elif "Software" in tag_str:
            exif_data.software = value_str

    if gps_data:
        exif_data.gps = gps_data
    if camera_data:
        exif_data.camera = camera_data

    return exif_data


def compute_perceptual_hash(image_bytes: bytes) -> str:
    img = Image.open(io.BytesIO(image_bytes))
    # Convert to RGB if needed
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    # pHash - robust to scaling, compression
    phash = imagehash.phash(img)
    return str(phash)


def compute_dhash(image_bytes: bytes) -> str:
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    dhash = imagehash.dhash(img)
    return str(dhash)


def extract_face_embeddings(image_bytes: bytes) -> Optional[List[List[float]]]:
    """Extract face embeddings using face_recognition (dlib-based)"""
    try:
        import face_recognition
        img = face_recognition.load_image_file(io.BytesIO(image_bytes))
        locations = face_recognition.face_locations(img)
        if not locations:
            return None
        embeddings = face_recognition.face_encodings(img, locations)
        return [emb.tolist() for emb in embeddings]
    except Exception:
        return None


async def search_google_images(image_url: str, api_key: str, cse_id: str) -> List[Dict]:
    """Search using Google Custom Search API"""
    if not api_key or not cse_id:
        return []

    params = {
        "key": api_key,
        "cx": cse_id,
        "q": f"site:instagram.com OR site:twitter.com OR site:linkedin.com OR site:facebook.com {image_url}",
        "searchType": "image",
        "num": 10,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get("https://www.googleapis.com/customsearch/v1", params=params)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("items", [])
    except Exception:
        pass
    return []


async def search_yandex_images(image_url: str, api_key: str) -> List[Dict]:
    """Search using Yandex Images API"""
    if not api_key:
        return []
    # Yandex API implementation would go here
    return []


async def search_tineye(image_url: str, api_key: str) -> List[Dict]:
    """Search using TinEye API"""
    if not api_key:
        return []
    # TinEye API implementation would go here
    return []


async def search_bing_visual(image_url: str, api_key: str) -> List[Dict]:
    """Search using Bing Visual Search API"""
    if not api_key:
        return []
    # Bing Visual Search implementation would go here
    return []


async def reverse_image_search(
    image_bytes: bytes,
    image_url: Optional[str] = None,
    engines: Optional[List[str]] = None,
    extract_exif_flag: bool = True,
    extract_faces: bool = True,
    perceptual_hash_flag: bool = True,
) -> Dict[str, Any]:
    results = {
        "source_url": image_url,
        "exif": None,
        "perceptual_hash": None,
        "dhash": None,
        "face_embeddings": None,
        "engine_results": {},
        "face_matches": [],
    }

    # EXIF
    if extract_exif_flag:
        exif = extract_exif(image_bytes)
        results["exif"] = {
            "gps": exif.gps,
            "camera": exif.camera,
            "datetime": exif.datetime,
            "software": exif.software,
            "raw": exif.raw,
        }

    # Perceptual hashes
    if perceptual_hash_flag:
        results["perceptual_hash"] = compute_perceptual_hash(image_bytes)
        results["dhash"] = compute_dhash(image_bytes)

    # Face embeddings
    if extract_faces:
        results["face_embeddings"] = extract_face_embeddings(image_bytes)

    # Engine searches (if URL provided and keys configured)
    if image_url:
        enabled_engines = engines or ["google"]
        if "google" in enabled_engines:
            results["engine_results"]["google"] = await search_google_images(
                image_url, settings.GOOGLE_API_KEY or "", settings.GOOGLE_CSE_ID or ""
            )
        if "yandex" in enabled_engines:
            results["engine_results"]["yandex"] = await search_yandex_images(
                image_url, settings.YANDEX_API_KEY or ""
            )
        if "tineye" in enabled_engines:
            results["engine_results"]["tineye"] = await search_tineye(
                image_url, settings.TINEYE_API_KEY or ""
            )
        if "bing" in enabled_engines:
            results["engine_results"]["bing"] = await search_bing_visual(
                image_url, settings.BING_API_KEY or ""
            )

    return results