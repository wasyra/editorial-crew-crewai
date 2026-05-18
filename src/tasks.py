from crewai import Agent, Task

from src.schemas import ResearchDossier


def build_tasks(
    researcher: Agent,
    writer: Agent,
    editor: Agent,
) -> tuple[Task, Task, Task]:
    research_task = Task(
        description=(
            "Tema: {topic}. Haz UNA búsqueda Tavily y devuelve exactamente 3 noticias "
            "recientes (título, url, fecha, summary breve, relevance). "
            "2 suggested_angles para LinkedIn."
        ),
        expected_output="ResearchDossier con 3 news_items.",
        agent=researcher,
        output_pydantic=ResearchDossier,
    )

    write_task = Task(
        description=(
            "Con el dossier, borrador LinkedIn sobre {topic}, tono {tone}. "
            "Gancho + cuerpo corto + CTA + 3 hashtags. Máximo 180 palabras."
        ),
        expected_output="Borrador Markdown breve.",
        agent=writer,
        context=[research_task],
    )

    edit_task = Task(
        description=(
            "Revisa el borrador ({topic}, tono {tone}). Responde SOLO con este formato:\n\n"
            "## Feedback del editor\n"
            "- (bullet 1, máx 1 línea)\n"
            "- (bullet 2)\n"
            "- (bullet 3)\n\n"
            "## Post final (LinkedIn)\n"
            "(post listo para publicar, máx 200 palabras, hashtags al final)\n\n"
            "No añadas secciones extra. No repitas el dossier completo."
        ),
        expected_output=(
            "Markdown con exactamente '## Feedback del editor' y "
            "'## Post final (LinkedIn)'."
        ),
        agent=editor,
        context=[write_task],
    )

    return research_task, write_task, edit_task
