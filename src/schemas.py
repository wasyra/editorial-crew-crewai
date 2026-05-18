from pydantic import BaseModel, Field


class NewsItem(BaseModel):
    title: str = Field(..., description="Título de la noticia")
    url: str = Field(..., description="URL de la fuente")
    date: str = Field(..., description="Fecha de publicación o 'No disponible'")
    summary: str = Field(..., description="Resumen factual en 3-4 líneas")
    relevance: str = Field(..., description="Por qué es relevante para el tema")


class ResearchDossier(BaseModel):
    topic: str = Field(..., description="Tema investigado")
    news_items: list[NewsItem] = Field(
        ...,
        min_length=3,
        max_length=3,
        description="Exactamente 3 noticias recientes",
    )
    suggested_angles: list[str] = Field(
        ...,
        min_length=2,
        max_length=3,
        description="Ángulos sugeridos para un post de LinkedIn",
    )
