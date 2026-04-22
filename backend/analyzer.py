import asyncio
import base64
import json
import os
import httpx
from pathlib import Path

OPENROUTER_KEY = os.environ["OPENROUTER_API_KEY"]
VISION_MODEL   = "google/gemini-2.0-flash-exp:free"
SCREENSHOTS_DIR = Path(__file__).parent.parent / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True)


async def take_screenshot(url: str, slug: str) -> str | None:
    """
    Returns the relative path to the saved screenshot, or None on failure.
    Slug is used as the filename.
    """
    from playwright.async_api import async_playwright

    out_path = SCREENSHOTS_DIR / f"{slug}.jpg"
    if out_path.exists():
        return f"/screenshots/{slug}.jpg"

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            ctx = await browser.new_context(
                viewport={"width": 1280, "height": 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            )
            page = await ctx.new_page()
            await page.goto(url, timeout=20000, wait_until="domcontentloaded")
            await asyncio.sleep(1.5)
            await page.screenshot(path=str(out_path), type="jpeg", quality=72, full_page=False)
            await browser.close()
        return f"/screenshots/{slug}.jpg"
    except Exception as e:
        print(f"  Screenshot failed {url}: {e}")
        return None


async def critique_website(screenshot_path: str, business_name: str, website_url: str) -> dict:
    """Send screenshot to OpenRouter vision model. Returns critique dict."""
    full_path = SCREENSHOTS_DIR.parent / screenshot_path.lstrip("/")
    if not full_path.exists():
        return _no_screenshot_critique()

    img_b64 = base64.b64encode(full_path.read_bytes()).decode()

    payload = {
        "model": VISION_MODEL,
        "messages": [{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}
                },
                {
                    "type": "text",
                    "text": (
                        f'You are a web design expert evaluating a local business website for a web design agency.\n\n'
                        f'Business: "{business_name}"\nURL: {website_url}\n\n'
                        'Rate this website and return ONLY valid JSON (no markdown fences):\n'
                        '{\n'
                        '  "ugly_score": <1-10 integer, 1=modern/professional, 10=severely outdated>,\n'
                        '  "issues": ["issue 1", "issue 2", "issue 3"],\n'
                        '  "summary": "one honest sentence",\n'
                        '  "recommendation": "one sentence on what they need most"\n'
                        '}'
                    )
                }
            ]
        }],
        "max_tokens": 400,
        "extra_body": {"transforms": ["middle-out"]},
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers={
                "Authorization": f"Bearer {OPENROUTER_KEY}",
                "HTTP-Referer": "https://hermes-agent.nousresearch.com",
                "X-Title": "Ugly Duck Scraper",
            },
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"].strip()

    # Strip markdown fences if model ignored instructions
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]

    try:
        return json.loads(content)
    except Exception:
        return {"ugly_score": 5, "issues": ["Could not parse critique"], "summary": content[:200], "recommendation": ""}


def _no_screenshot_critique() -> dict:
    return {
        "ugly_score": 0,
        "issues": ["Could not load website"],
        "summary": "Website timed out or is unreachable.",
        "recommendation": "Verify the site is live before outreach.",
    }


async def analyze_business(business: dict) -> dict:
    """Full pipeline: screenshot + critique. Mutates and returns the business dict."""
    url = business.get("website", "")
    if not url:
        business["screenshot"] = None
        business["critique"] = {
            "ugly_score": 10,
            "issues": ["No website at all"],
            "summary": "This business has no website — the hottest possible lead.",
            "recommendation": "Lead with a starter website package.",
        }
        return business

    # Slug from place_id for deterministic filenames
    slug = business["place_id"].replace("-", "")[:24]

    screenshot_path = await take_screenshot(url, slug)
    business["screenshot"] = screenshot_path

    if screenshot_path:
        business["critique"] = await critique_website(screenshot_path, business["name"], url)
    else:
        business["critique"] = _no_screenshot_critique()

    return business
