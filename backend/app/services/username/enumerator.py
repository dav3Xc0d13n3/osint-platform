# Username Enumeration Service
import asyncio
import time
from typing import List, Optional
from dataclasses import dataclass
import httpx
from bs4 import BeautifulSoup

from app.core.config import get_settings
from app.schemas.osint import PlatformResult

settings = get_settings()


# Platform definitions: (name, url_template, method, detection)
# method: "get" | "head" | "post"
# detection: "status" | "text" | "selector" | "redirect"
PLATFORMS = [
    # Major Social
    ("GitHub", "https://github.com/{username}", "get", "status"),
    ("Twitter", "https://twitter.com/{username}", "get", "status"),
    ("Instagram", "https://www.instagram.com/{username}/", "get", "status"),
    ("LinkedIn", "https://www.linkedin.com/in/{username}", "get", "status"),
    ("Facebook", "https://www.facebook.com/{username}", "get", "status"),
    ("Reddit", "https://www.reddit.com/user/{username}", "get", "status"),
    ("YouTube", "https://www.youtube.com/@{username}", "get", "status"),
    ("TikTok", "https://www.tiktok.com/@{username}", "get", "status"),
    ("Twitch", "https://www.twitch.tv/{username}", "get", "status"),
    ("Discord", "https://discord.com/users/{username}", "get", "status"),
    ("Telegram", "https://t.me/{username}", "get", "status"),
    ("Medium", "https://medium.com/@{username}", "get", "status"),
    ("Dev.to", "https://dev.to/{username}", "get", "status"),
    ("Hashnode", "https://{username}.hashnode.dev", "get", "status"),
    ("Substack", "https://{username}.substack.com", "get", "status"),

    # Code & Dev
    ("GitLab", "https://gitlab.com/{username}", "get", "status"),
    ("Bitbucket", "https://bitbucket.org/{username}", "get", "status"),
    ("SourceForge", "https://sourceforge.net/u/{username}", "get", "status"),
    ("CodePen", "https://codepen.io/{username}", "get", "status"),
    ("Replit", "https://replit.com/@{username}", "get", "status"),
    ("Glitch", "https://glitch.com/@{username}", "get", "status"),
    ("StackOverflow", "https://stackoverflow.com/users/{username}", "get", "status"),
    ("HackerRank", "https://www.hackerrank.com/{username}", "get", "status"),
    ("LeetCode", "https://leetcode.com/{username}", "get", "status"),
    ("Codeforces", "https://codeforces.com/profile/{username}", "get", "status"),
    ("AtCoder", "https://atcoder.jp/users/{username}", "get", "status"),
    ("Kaggle", "https://www.kaggle.com/{username}", "get", "status"),
    ("HuggingFace", "https://huggingface.co/{username}", "get", "status"),
    ("Docker Hub", "https://hub.docker.com/u/{username}", "get", "status"),
    ("NPM", "https://www.npmjs.com/~{username}", "get", "status"),
    ("PyPI", "https://pypi.org/user/{username}", "get", "status"),
    ("Crates.io", "https://crates.io/users/{username}", "get", "status"),
    ("GoDoc", "https://pkg.go.dev/search?q=user:{username}", "get", "status"),

    # Creative & Portfolio
    ("Behance", "https://www.behance.net/{username}", "get", "status"),
    ("Dribbble", "https://dribbble.com/{username}", "get", "status"),
    ("ArtStation", "https://www.artstation.com/{username}", "get", "status"),
    ("DeviantArt", "https://www.deviantart.com/{username}", "get", "status"),
    ("500px", "https://500px.com/{username}", "get", "status"),
    ("Flickr", "https://www.flickr.com/people/{username}", "get", "status"),
    ("VSCO", "https://vsco.co/{username}", "get", "status"),
    ("Unsplash", "https://unsplash.com/@{username}", "get", "status"),
    ("Pinterest", "https://www.pinterest.com/{username}", "get", "status"),
    ("Ello", "https://ello.co/{username}", "get", "status"),

    # Gaming
    ("Steam", "https://steamcommunity.com/id/{username}", "get", "status"),
    ("Xbox", "https://xboxgamertag.com/search/{username}", "get", "text"),
    ("PlayStation", "https://psnprofiles.com/{username}", "get", "status"),
    ("Epic Games", "https://www.epicgames.com/id/{username}", "get", "status"),
    ("Battle.net", "https://www.battle.net/profile/{username}", "get", "status"),
    ("Origin", "https://www.origin.com/{username}", "get", "status"),
    ("Uplay", "https://profile.ubisoft.com/{username}", "get", "status"),
    ("Roblox", "https://www.roblox.com/user.aspx?username={username}", "get", "status"),
    ("Minecraft", "https://www.minecraft.net/profile/{username}", "get", "status"),
    ("Chess.com", "https://www.chess.com/member/{username}", "get", "status"),
    ("Lichess", "https://lichess.org/@/{username}", "get", "status"),

    # Forums & Communities
    ("Discord (old)", "https://discordapp.com/users/{username}", "get", "status"),
    ("Reddit (old)", "https://old.reddit.com/user/{username}", "get", "status"),
    ("Quora", "https://www.quora.com/profile/{username}", "get", "status"),
    ("StackExchange", "https://stackexchange.com/users/{username}", "get", "status"),
    ("ProductHunt", "https://www.producthunt.com/@{username}", "get", "status"),
    ("IndieHackers", "https://www.indiehackers.com/{username}", "get", "status"),
    ("HackerNews", "https://news.ycombinator.com/user?id={username}", "get", "status"),
    ("Lobsters", "https://lobste.rs/u/{username}", "get", "status"),
    ("Tildes", "https://tildes.net/~{username}", "get", "status"),

    # Messaging & Communication
    ("Skype", "https://www.skype.com/{username}", "get", "status"),
    ("Wire", "https://app.wire.com/{username}", "get", "status"),
    ("Keybase", "https://keybase.io/{username}", "get", "status"),
    ("Matrix", "https://matrix.to/#/@{username}:matrix.org", "get", "status"),

    # Writing & Blogging
    ("WordPress.com", "https://{username}.wordpress.com", "get", "status"),
    ("Blogger", "https://{username}.blogspot.com", "get", "status"),
    ("Tumblr", "https://{username}.tumblr.com", "get", "status"),
    ("Ghost", "https://{username}.ghost.io", "get", "status"),
    ("Write.as", "https://write.as/{username}", "get", "status"),

    # Audio & Video
    ("SoundCloud", "https://soundcloud.com/{username}", "get", "status"),
    ("Bandcamp", "https://{username}.bandcamp.com", "get", "status"),
    ("Mixcloud", "https://www.mixcloud.com/{username}", "get", "status"),
    ("Audius", "https://audius.co/{username}", "get", "status"),
    ("Vimeo", "https://vimeo.com/{username}", "get", "status"),
    ("Dailymotion", "https://www.dailymotion.com/{username}", "get", "status"),
    ("Rumble", "https://rumble.com/user/{username}", "get", "status"),
    ("PeerTube", "https://peertube.social/@{username}", "get", "status"),

    # Design & 3D
    ("Figma", "https://www.figma.com/@{username}", "get", "status"),
    ("Sketchfab", "https://sketchfab.com/{username}", "get", "status"),
    ("Thingiverse", "https://www.thingiverse.com/{username}", "get", "status"),
    ("MyMiniFactory", "https://www.myminifactory.com/users/{username}", "get", "status"),
    ("GrabCAD", "https://grabcad.com/{username}", "get", "status"),

    # Security & Privacy
    ("HaveIBeenPwned", "https://haveibeenpwned.com/account/{username}", "get", "status"),
    ("DeHashed", "https://www.dehashed.com/search?query={username}", "get", "status"),
    ("IntelligenceX", "https://intelx.io/search?term={username}", "get", "status"),

    # Miscellaneous
    ("Gravatar", "https://en.gravatar.com/{username}", "get", "status"),
    ("About.me", "https://about.me/{username}", "get", "status"),
    ("Linktree", "https://linktr.ee/{username}", "get", "status"),
    ("Ko-fi", "https://ko-fi.com/{username}", "get", "status"),
    ("Patreon", "https://www.patreon.com/{username}", "get", "status"),
    ("BuyMeACoffee", "https://www.buymeacoffee.com/{username}", "get", "status"),
    ("Liberapay", "https://liberapay.com/{username}", "get", "status"),
    ("OpenCollective", "https://opencollective.com/{username}", "get", "status"),
    ("Keyoxide", "https://keyoxide.org/{username}", "get", "status"),
]


@dataclass
class Platform:
    name: str
    url_template: str
    method: str
    detection: str


def build_platforms(selected: Optional[List[str]] = None) -> List[Platform]:
    platforms = [Platform(*p) for p in PLATFORMS]
    if selected:
        selected_lower = {s.lower() for s in selected}
        platforms = [p for p in platforms if p.name.lower() in selected_lower]
    return platforms


async def check_platform(
    client: httpx.AsyncClient,
    platform: Platform,
    username: str,
    timeout: int,
) -> PlatformResult:
    url = platform.url_template.format(username=username)
    start = time.perf_counter()

    try:
        if platform.method == "head":
            resp = await client.head(url, timeout=timeout, follow_redirects=True)
        else:
            resp = await client.get(url, timeout=timeout, follow_redirects=True)

        elapsed = time.perf_counter() - start
        exists = False

        if platform.detection == "status":
            exists = resp.status_code == 200
        elif platform.detection == "text":
            exists = username.lower() in resp.text.lower()
        elif platform.detection == "redirect":
            exists = str(resp.url) != url
        elif platform.detection == "selector":
            soup = BeautifulSoup(resp.text, "html.parser")
            exists = bool(soup.select(platform.url_template))

        return PlatformResult(
            platform=platform.name,
            url=str(resp.url),
            exists=exists,
            status_code=resp.status_code,
            response_time=round(elapsed, 3),
        )

    except httpx.TimeoutException:
        return PlatformResult(
            platform=platform.name,
            url=url,
            exists=False,
            error="Timeout",
        )
    except httpx.HTTPError as e:
        return PlatformResult(
            platform=platform.name,
            url=url,
            exists=False,
            error=str(e),
        )
    except Exception as e:
        return PlatformResult(
            platform=platform.name,
            url=url,
            exists=False,
            error=f"Unexpected: {type(e).__name__}",
        )


async def enumerate_username(
    username: str,
    platforms: Optional[List[str]] = None,
    timeout: int = 30,
    concurrency: int = 50,
) -> dict:
    platform_list = build_platforms(platforms)
    semaphore = asyncio.Semaphore(concurrency)

    async def bounded_check(p: Platform) -> PlatformResult:
        async with semaphore:
            async with httpx.AsyncClient(
                headers={"User-Agent": "OSINT-Platform/1.0"},
                follow_redirects=True,
            ) as client:
                return await check_platform(client, p, username, timeout)

    start = time.perf_counter()
    tasks = [bounded_check(p) for p in platform_list]
    results = await asyncio.gather(*tasks)
    elapsed = time.perf_counter() - start

    found = sum(1 for r in results if r.exists)
    not_found = sum(1 for r in results if not r.exists and not r.error)
    errors = sum(1 for r in results if r.error)

    return {
        "username": username,
        "total_platforms": len(platform_list),
        "found": found,
        "not_found": not_found,
        "errors": errors,
        "results": [r.model_dump() for r in results],
        "elapsed_time": round(elapsed, 2),
    }