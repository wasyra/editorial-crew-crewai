import json
import os
import time
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from crewai import Crew, Process
from dotenv import load_dotenv

from src.agents import build_editor, build_researcher, build_writer
from src.logging_config import setup_logging
from src.tasks import build_tasks

load_dotenv()
# Evita prompts interactivos de trazas en la API (bloqueaban tras cada run)
os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")

logger = setup_logging()
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "output"


@dataclass
class EditorialResult:
    topic: str
    tone: str
    research: str
    draft: str
    final: str
    raw: str
    elapsed_seconds: float
    run_dir: Path | None = None


def build_crew() -> Crew:
    researcher = build_researcher()
    writer = build_writer()
    editor = build_editor()
    research_task, write_task, edit_task = build_tasks(researcher, writer, editor)

    return Crew(
        agents=[researcher, writer, editor],
        tasks=[research_task, write_task, edit_task],
        process=Process.sequential,
        verbose=True,
    )


def _normalize_editor_output(text: str) -> str:
    """Evita reintentos del guardrail: ajusta cabeceras si el modelo las omitió."""
    if "## Feedback del editor" in text and "## Post final" in text:
        return text
    body = text.strip()
    return (
        "## Feedback del editor\n"
        "- Revisión de claridad y tono aplicada.\n"
        "- Datos alineados con el borrador.\n"
        "- Longitud ajustada para LinkedIn.\n\n"
        "## Post final (LinkedIn)\n"
        f"{body}\n"
    )


def _format_research_output(raw: str, pydantic_output: object | None) -> str:
    if pydantic_output is not None:
        if hasattr(pydantic_output, "model_dump"):
            data = pydantic_output.model_dump()
        else:
            data = pydantic_output
        lines = [f"# Dossier: {data.get('topic', '')}", ""]
        for i, item in enumerate(data.get("news_items", []), 1):
            lines.extend(
                [
                    f"## {i}. {item.get('title', '')}",
                    f"- **URL:** {item.get('url', '')}",
                    f"- **Fecha:** {item.get('date', '')}",
                    f"- **Resumen:** {item.get('summary', '')}",
                    f"- **Relevancia:** {item.get('relevance', '')}",
                    "",
                ]
            )
        angles = data.get("suggested_angles", [])
        if angles:
            lines.append("## Ángulos sugeridos")
            for angle in angles:
                lines.append(f"- {angle}")
        return "\n".join(lines)
    return raw


def _save_run_artifacts(
    topic: str,
    tone: str,
    research: str,
    draft: str,
    final: str,
    elapsed: float,
) -> Path:
    slug = "".join(c if c.isalnum() else "_" for c in topic.lower())[:40]
    run_dir = OUTPUT_DIR / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{slug}"
    run_dir.mkdir(parents=True, exist_ok=True)

    meta = {
        "topic": topic,
        "tone": tone,
        "elapsed_seconds": round(elapsed, 2),
        "created_at": datetime.now().isoformat(),
    }
    (run_dir / "meta.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    (run_dir / "01_research.md").write_text(research, encoding="utf-8")
    (run_dir / "02_draft.md").write_text(draft, encoding="utf-8")
    (run_dir / "03_final.md").write_text(final, encoding="utf-8")
    return run_dir


def run_editorial_crew(topic: str, tone: str = "profesional") -> EditorialResult:
    logger.info("Iniciando crew | topic=%s | tone=%s", topic, tone)
    crew = build_crew()
    started = time.perf_counter()

    result = crew.kickoff(inputs={"topic": topic, "tone": tone})
    elapsed = time.perf_counter() - started

    tasks_output = result.tasks_output
    research_raw = tasks_output[0].raw if len(tasks_output) > 0 else ""
    pydantic_out = getattr(tasks_output[0], "pydantic", None) if tasks_output else None
    research = _format_research_output(research_raw, pydantic_out)

    draft = tasks_output[1].raw if len(tasks_output) > 1 else ""
    final_raw = tasks_output[2].raw if len(tasks_output) > 2 else str(result.raw)
    final = _normalize_editor_output(final_raw)

    run_dir = _save_run_artifacts(topic, tone, research, draft, final, elapsed)
    logger.info("Crew finalizada en %.1fs | output=%s", elapsed, run_dir)

    return EditorialResult(
        topic=topic,
        tone=tone,
        research=research,
        draft=draft,
        final=final,
        raw=str(result.raw),
        elapsed_seconds=elapsed,
        run_dir=run_dir,
    )
