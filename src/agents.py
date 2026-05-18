import os

from crewai import Agent, LLM
from crewai_tools import TavilySearchTool

DEFAULT_GEMINI_MODEL = "gemini/gemini-3.1-flash-lite-preview"


def _gemini_api_key() -> str:
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not key:
        raise ValueError(
            "GEMINI_API_KEY no está configurada. Obtén una en "
            "https://aistudio.google.com/apikey y añádela a .env"
        )
    return key


def _llm(*, temperature: float = 0.6) -> LLM:
    model = os.getenv("GEMINI_MODEL_NAME", DEFAULT_GEMINI_MODEL)
    if not model.startswith("gemini/"):
        model = f"gemini/{model}"
    return LLM(
        model=model,
        api_key=_gemini_api_key(),
        temperature=temperature,
    )


def build_researcher() -> Agent:
    if not os.getenv("TAVILY_API_KEY"):
        raise ValueError(
            "TAVILY_API_KEY no está configurada. Copia .env.example a .env y añade tu clave."
        )
    tavily = TavilySearchTool(
        search_depth="basic",
        max_results=3,
        topic="news",
        time_range="week",
    )
    return Agent(
        role="Investigador de noticias tecnológicas",
        goal=(
            "En una sola búsqueda Tavily, obtener 3 noticias recientes sobre {topic} "
            "y devolver el dossier estructurado."
        ),
        backstory=(
            "Periodista tech. Una búsqueda, tres noticias, sin rodeos. "
            "No redactas posts."
        ),
        tools=[tavily],
        llm=_llm(temperature=0.5),
        verbose=True,
        allow_delegation=False,
        max_iter=4,
    )


def build_writer() -> Agent:
    return Agent(
        role="Redactor de contenido para LinkedIn",
        goal=(
            "Un borrador corto de LinkedIn sobre {topic}, tono {tone}, "
            "solo con datos del dossier."
        ),
        backstory=(
            "Copywriter B2B. Posts directos: gancho, 2-3 párrafos, CTA, hashtags. "
            "Máximo 180 palabras."
        ),
        llm=_llm(temperature=0.65),
        verbose=True,
        allow_delegation=False,
        max_iter=4,
    )


def build_editor() -> Agent:
    return Agent(
        role="Editor senior de LinkedIn",
        goal=(
            "En UNA pasada: 3 viñetas de feedback breve + post final sobre {topic} "
            "(tono {tone}). Sin reescribir todo el informe."
        ),
        backstory=(
            "Editor rápido. Feedback mínimo (3 bullets). Luego el post final pulido. "
            "No repitas el dossier ni el borrador entero."
        ),
        llm=_llm(temperature=0.4),
        verbose=True,
        allow_delegation=False,
        max_iter=2,
    )
