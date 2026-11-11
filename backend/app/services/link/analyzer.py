# Link Analysis Service
import asyncio
import ssl
import socket
import re
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import urlparse, urljoin
from dataclasses import dataclass

import httpx
import dns.resolver
from bs4 import BeautifulSoup

from app.core.config import get_settings

settings = get_settings()


def extract_domain(hostname: str) -> Optional[str]:
    """Simple domain extraction without tldextract"""
    if not hostname:
        return None
    # Remove port if present
    hostname = hostname.split(':')[0]
    # Split by dots
    parts = hostname.split('.')
    if len(parts) < 2:
        return None
    # Handle common TLDs and ccTLDs - take last 2 parts for most cases
    # This is a simplified version - for production you'd want a proper public suffix list
    if len(parts) >= 3 and len(parts[-2]) <= 3 and len(parts[-1]) <= 3:
        # Possible ccTLD like .co.uk, .com.au
        return '.'.join(parts[-3:])
    return '.'.join(parts[-2:])


@dataclass
class RedirectHop:
    url: str
    status_code: int
    headers: Dict
    latency: float


@dataclass
class MetadataResult:
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    type: Optional[str] = None
    site_name: Optional[str] = None
    twitter_card: Optional[Dict] = None
    json_ld: List[Dict] = None


@dataclass
class SSLInfo:
    valid: bool
    issuer: Optional[str] = None
    subject: Optional[str] = None
    not_before: Optional[str] = None
    not_after: Optional[str] = None
    san: List[str] = None
    fingerprint: Optional[str] = None


async def expand_url(url: str, timeout: int = 10) -> str:
    """Resolve short URLs to final destination"""
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            resp = await client.head(url)
            return str(resp.url)
    except Exception:
        return url


async def follow_redirects(url: str, timeout: int = 10, max_redirects: int = 20) -> List[RedirectHop]:
    """Follow redirect chain and capture each hop"""
    hops = []
    current_url = url

    async with httpx.AsyncClient(timeout=timeout, follow_redirects=False) as client:
        for _ in range(max_redirects):
            try:
                start = asyncio.get_event_loop().time()
                resp = await client.get(current_url)
                latency = asyncio.get_event_loop().time() - start

                hops.append(RedirectHop(
                    url=str(resp.url),
                    status_code=resp.status_code,
                    headers=dict(resp.headers),
                    latency=round(latency, 3),
                ))

                if 300 <= resp.status_code < 400:
                    location = resp.headers.get("location")
                    if location:
                        current_url = urljoin(str(resp.url), location)
                        continue
                break
            except Exception:
                break

    return hops


def extract_metadata(html: str, base_url: str) -> MetadataResult:
    """Extract Open Graph, Twitter Cards, JSON-LD metadata"""
    soup = BeautifulSoup(html, "html.parser")
    result = MetadataResult(json_ld=[])

    # Open Graph
    for meta in soup.find_all("meta", property=True):
        prop = meta.get("property", "")
        content = meta.get("content", "")
        if prop == "og:title":
            result.title = content
        elif prop == "og:description":
            result.description = content
        elif prop == "og:image":
            result.image = urljoin(base_url, content)
        elif prop == "og:type":
            result.type = content
        elif prop == "og:site_name":
            result.site_name = content

    # Twitter Cards
    twitter_data = {}
    for meta in soup.find_all("meta", attrs={"name": lambda x: x and x.startswith("twitter:")}):
        name = meta.get("name", "")
        content = meta.get("content", "")
        twitter_data[name] = content
    if twitter_data:
        result.twitter_card = twitter_data

    # JSON-LD
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            import json
            data = json.loads(script.string)
            result.json_ld.append(data)
        except Exception:
            pass

    # Fallback to standard meta tags
    if not result.title:
        title_tag = soup.find("title")
        if title_tag:
            result.title = title_tag.get_text(strip=True)

    if not result.description:
        desc_meta = soup.find("meta", attrs={"name": "description"})
        if desc_meta:
            result.description = desc_meta.get("content", "")

    return result


async def get_ssl_info(hostname: str, port: int = 443) -> SSLInfo:
    """Get SSL/TLS certificate information"""
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                cert_bin = ssock.getpeercert(binary_form=True)

                import hashlib
                fingerprint = hashlib.sha256(cert_bin).hexdigest()

                san = []
                for ext in cert.get("subjectAltName", []):
                    san.append(ext[1])

                return SSLInfo(
                    valid=True,
                    issuer=dict(cert.get("issuer", [])).get("commonName"),
                    subject=dict(cert.get("subject", [])).get("commonName"),
                    not_before=cert.get("notBefore"),
                    not_after=cert.get("notAfter"),
                    san=san,
                    fingerprint=fingerprint,
                )
    except Exception as e:
        return SSLInfo(valid=False, issuer=str(e))


async def enumerate_subdomains(domain: str) -> List[str]:
    """Passive subdomain enumeration via certificate transparency logs"""
    subdomains = set()

    try:
        # crt.sh
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"https://crt.sh/?q=%.{domain}&output=json"
            )
            if resp.status_code == 200:
                for entry in resp.json():
                    name = entry.get("name_value", "")
                    for sub in name.split("\n"):
                        sub = sub.strip().lower()
                        if sub.endswith(f".{domain}") or sub == domain:
                            subdomains.add(sub)
    except Exception:
        pass

    return sorted(subdomains)


async def check_archives(url: str) -> List[str]:
    """Check Wayback Machine for snapshots"""
    snapshots = []
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"http://web.archive.org/cdx/search/cdx",
                params={
                    "url": url,
                    "output": "json",
                    "fl": "original,timestamp",
                    "collapse": "timestamp",
                    "limit": 20,
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                if len(data) > 1:  # First row is header
                    for row in data[1:]:
                        original, timestamp = row[0], row[1]
                        snapshots.append(f"https://web.archive.org/web/{timestamp}/{original}")
    except Exception:
        pass
    return snapshots


async def check_threat_intel(url: str) -> List[Dict]:
    """Check URL against threat intelligence feeds"""
    results = []

    # VirusTotal
    if settings.VIRUSTOTAL_API_KEY:
        try:
            import hashlib
            url_id = hashlib.sha256(url.encode()).hexdigest()
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    f"https://www.virustotal.com/api/v3/urls/{url_id}",
                    headers={"x-apikey": settings.VIRUSTOTAL_API_KEY}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                    results.append({
                        "source": "VirusTotal",
                        "malicious": stats.get("malicious", 0) > 0,
                        "categories": [],
                        "details": stats,
                    })
        except Exception:
            pass

    # URLhaus
    if settings.URLHAUS_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://urlhaus-api.abuse.ch/v1/url/",
                    data={"url": url}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results.append({
                        "source": "URLhaus",
                        "malicious": data.get("query_status") == "ok",
                        "categories": [data.get("threat", "")],
                        "details": data,
                    })
        except Exception:
            pass

    # AlienVault OTX
    if settings.ALIENVAULT_API_KEY:
        try:
            import hashlib
            url_hash = hashlib.md5(url.encode()).hexdigest()
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(
                    f"https://otx.alienvault.com/api/v1/indicators/url/{url_hash}/general",
                    headers={"X-OTX-API-KEY": settings.ALIENVAULT_API_KEY}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    pulse_info = data.get("pulse_info", {})
                    results.append({
                        "source": "AlienVault OTX",
                        "malicious": pulse_info.get("count", 0) > 0,
                        "categories": [p.get("name") for p in pulse_info.get("pulses", [])],
                        "details": pulse_info,
                    })
        except Exception:
            pass

    return results


async def analyze_link(
    url: str,
    expand_shorteners: bool = True,
    follow_redirects_flag: bool = True,
    extract_metadata_flag: bool = True,
    check_ssl_flag: bool = True,
    enumerate_subdomains_flag: bool = True,
    check_archives_flag: bool = True,
    threat_intel_flag: bool = True,
) -> Dict:
    result = {
        "original_url": url,
        "final_url": url,
        "redirect_chain": [],
        "metadata": None,
        "ssl": None,
        "subdomains": [],
        "archive_snapshots": [],
        "threat_intel": [],
    }

    # Expand shorteners
    if expand_shorteners:
        result["final_url"] = await expand_url(url)

    # Follow redirects
    if follow_redirects_flag:
        hops = await follow_redirects(result["final_url"])
        result["redirect_chain"] = [
            {
                "url": h.url,
                "status_code": h.status_code,
                "headers": h.headers,
                "latency": h.latency,
            }
            for h in hops
        ]
        if hops:
            result["final_url"] = hops[-1].url

    # Extract metadata from final URL
    if extract_metadata_flag:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(result["final_url"])
                if resp.status_code == 200:
                    meta = extract_metadata(resp.text, result["final_url"])
                    result["metadata"] = {
                        "title": meta.title,
                        "description": meta.description,
                        "image": meta.image,
                        "type": meta.type,
                        "site_name": meta.site_name,
                        "twitter_card": meta.twitter_card,
                        "json_ld": meta.json_ld,
                    }
        except Exception:
            pass

    # SSL info
    if check_ssl_flag:
        try:
            parsed = urlparse(result["final_url"])
            if parsed.scheme == "https":
                ssl_info = await get_ssl_info(parsed.hostname)
                result["ssl"] = {
                    "valid": ssl_info.valid,
                    "issuer": ssl_info.issuer,
                    "subject": ssl_info.subject,
                    "not_before": ssl_info.not_before,
                    "not_after": ssl_info.not_after,
                    "san": ssl_info.san,
                    "fingerprint": ssl_info.fingerprint,
                }
        except Exception:
            pass

    # Subdomain enumeration
    if enumerate_subdomains_flag:
        try:
            parsed = urlparse(result["final_url"])
            domain = extract_domain(parsed.hostname)
            if domain:
                result["subdomains"] = await enumerate_subdomains(domain)
        except Exception:
            pass

    # Archive snapshots
    if check_archives_flag:
        result["archive_snapshots"] = await check_archives(result["final_url"])

    # Threat intelligence
    if threat_intel_flag:
        result["threat_intel"] = await check_threat_intel(result["final_url"])

    return result