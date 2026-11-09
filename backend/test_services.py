# Test Script
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.username.enumerator import enumerate_username
from app.services.image.searcher import reverse_image_search, extract_exif, compute_perceptual_hash
from app.services.link.analyzer import analyze_link


async def test_username():
    print("Testing username enumeration...")
    result = await enumerate_username(
        username="github",
        platforms=["GitHub", "Twitter", "GitLab"],
        timeout=10,
        concurrency=5,
    )
    print(f"Found: {result['found']}/{result['total_platforms']}")
    for r in result['results'][:5]:
        print(f"  {r['platform']}: {'✓' if r['exists'] else '✗'} ({r.get('status_code')})")
    return result


async def test_image():
    print("\nTesting image search...")
    # Create a simple test image
    from PIL import Image
    import io
    img = Image.new('RGB', (100, 100), color='red')
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    image_bytes = buf.getvalue()

    result = await reverse_image_search(
        image_bytes=image_bytes,
        extract_exif_flag=True,
        extract_faces=False,
        perceptual_hash_flag=True,
    )
    print(f"EXIF: {result.get('exif')}")
    print(f"Perceptual hash: {result.get('perceptual_hash')}")
    return result


async def test_link():
    print("\nTesting link analysis...")
    result = await analyze_link(
        url="https://github.com",
        expand_shorteners=True,
        follow_redirects_flag=True,
        extract_metadata_flag=True,
        check_ssl_flag=True,
        enumerate_subdomains_flag=False,
        check_archives_flag=False,
        threat_intel_flag=False,
    )
    print(f"Final URL: {result['final_url']}")
    print(f"Redirect hops: {len(result['redirect_chain'])}")
    print(f"Metadata: {result['metadata']}")
    print(f"SSL valid: {result['ssl']['valid'] if result['ssl'] else 'N/A'}")
    return result


async def main():
    print("=" * 50)
    print("OSINT Platform - Service Tests")
    print("=" * 50)

    try:
        await test_username()
        await test_image()
        await test_link()
        print("\n" + "=" * 50)
        print("All tests passed!")
        print("=" * 50)
    except Exception as e:
        print(f"\nTest failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())