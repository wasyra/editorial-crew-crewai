"""API REST para la sala editorial CrewAI."""

import logging
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("api")
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.crew import run_editorial_crew  # noqa: E402

app = FastAPI(
    title="Sala editorial CrewAI",
    description="Backend para el frontend VetaUI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=200)
    tone: str = Field(default="profesional")


class EditorialResponse(BaseModel):
    topic: str
    tone: str
    research: str
    draft: str
    final: str
    raw: str
    elapsed_seconds: float
    run_dir: str | None = None


def _to_response(result) -> EditorialResponse:
    return EditorialResponse(
        topic=result.topic,
        tone=result.tone,
        research=result.research,
        draft=result.draft,
        final=result.final,
        raw=result.raw,
        elapsed_seconds=result.elapsed_seconds,
        run_dir=str(result.run_dir) if result.run_dir else None,
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "editorial-crew-crewai"}


@app.post("/api/generate", response_model=EditorialResponse)
def generate(body: GenerateRequest):
    log.info(
        "Generando post | tema=%r | tono=%s (~2-8 min)",
        body.topic.strip()[:80],
        body.tone,
    )
    try:
        result = run_editorial_crew(
            topic=body.topic.strip(),
            tone=body.tone,
        )
        log.info("Listo en %.1fs", result.elapsed_seconds)
        return _to_response(result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error al ejecutar la crew: {exc}",
        ) from exc
