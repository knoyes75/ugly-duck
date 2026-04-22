import asyncio
import csv
import io
import json
import os
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path.home() / ".hermes" / ".env")

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from analyzer import analyze_business
from places import search_businesses
from randomizer import get_random

SCREENSHOTS_DIR = Path(__file__).parent.parent / "screenshots"
FRONTEND_DIR    = Path(__file__).parent.parent / "frontend" / "dist"

app = FastAPI(title="Ugly Duck")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/screenshots", StaticFiles(directory=str(SCREENSHOTS_DIR)), name="screenshots")


# ── Models ────────────────────────────────────────────────────────────────────

class ScanRequest(BaseModel):
    business_type: str
    city: str
    limit: int = 15


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/randomize")
def randomize():
    return get_random()


@app.post("/api/scan")
async def scan(req: ScanRequest):
    """
    SSE stream. Emits events:
      { type: "progress", message: str, current: int, total: int }
      { type: "result",   business: {...} }
      { type: "done" }
      { type: "error",    message: str }
    """
    async def event_stream():
        try:
            yield _sse("progress", {"message": f"Searching Google Maps for {req.business_type} in {req.city}…", "current": 0, "total": 0})

            businesses = await asyncio.to_thread(search_businesses, req.business_type, req.city, req.limit)
            total = len(businesses)

            if total == 0:
                yield _sse("error", {"message": "No businesses found. Try a different type or city."})
                return

            yield _sse("progress", {"message": f"Found {total} businesses. Analyzing websites…", "current": 0, "total": total})

            for i, biz in enumerate(businesses, 1):
                yield _sse("progress", {
                    "message": f"Analyzing {biz['name']}…",
                    "current": i,
                    "total": total,
                })
                biz = await analyze_business(biz)
                yield _sse("result", {"business": biz})

            yield _sse("done", {})

        except Exception as e:
            yield _sse("error", {"message": str(e)})

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.post("/api/export")
async def export_csv(businesses: list[dict]):
    """Export a list of businesses to CSV. Body is a JSON array."""
    output = io.StringIO()
    fieldnames = ["name", "address", "phone", "website", "rating", "ugly_score", "summary", "issues", "recommendation"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for b in businesses:
        critique = b.get("critique", {})
        writer.writerow({
            "name":           b.get("name", ""),
            "address":        b.get("address", ""),
            "phone":          b.get("phone", ""),
            "website":        b.get("website", ""),
            "rating":         b.get("rating", ""),
            "ugly_score":     critique.get("ugly_score", ""),
            "summary":        critique.get("summary", ""),
            "issues":         " | ".join(critique.get("issues", [])),
            "recommendation": critique.get("recommendation", ""),
        })
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ugly-duck-prospects.csv"},
    )


# ── Serve frontend (production) ───────────────────────────────────────────────

if FRONTEND_DIR.exists():
    from fastapi.staticfiles import StaticFiles as SF
    app.mount("/", SF(directory=str(FRONTEND_DIR), html=True), name="frontend")


def _sse(event_type: str, data: dict) -> str:
    return f"data: {json.dumps({'type': event_type, **data})}\n\n"


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
