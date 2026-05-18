# Arquitectura — Sala editorial CrewAI

## Diagrama de flujo

```mermaid
flowchart TB
    subgraph ui [Capa de presentación]
        WEB[Next.js VetaUI :3000]
        ST[Streamlit app.py :8501]
    end

    subgraph api [API]
        FAST[FastAPI :8001]
    end

    subgraph orchestration [CrewAI]
        CREW[Crew - Process.sequential]
        T1[research_task]
        T2[write_task]
        T3[edit_task]
    end

    subgraph agents [Agentes]
        R[Investigador]
        W[Redactor]
        E[Editor]
    end

    subgraph external [Servicios externos]
        TAV[Tavily API]
        GEM[Google Gemini]
    end

    subgraph persistence [Persistencia]
        OUT[output/]
        LOG[logs/runs.log]
    end

    WEB -->|POST /api/generate| FAST
    ST -->|topic, tone| CREW
    FAST --> CREW
    CREW --> T1 --> R
    R --> TAV
    R --> GEM
    T1 -->|ResearchDossier| T2
    T2 --> W --> GEM
    T2 -->|borrador| T3
    T3 --> E --> GEM
    T3 -->|final| FAST
    FAST --> WEB
    CREW --> OUT
    CREW --> LOG
```

## Capas

| Capa | Implementación |
|------|----------------|
| **UI principal** | `web/` — Next.js 15, VetaUI, panel de progreso |
| **API** | `api/main.py` — health + generate |
| **LLM** | Gemini vía `crewai[google-genai]` y `GEMINI_API_KEY` |
| **Tools** | `TavilySearchTool` solo en investigador |
| **Estado** | Contexto implícito entre tasks (`context=[...]`) |
| **Validación investigador** | `output_pydantic=ResearchDossier` |
| **Validación editor** | Prompt con formato fijo + `_normalize_editor_output()` en `crew.py` |
| **Orquestación** | `Crew` + `Process.sequential` |

## Task 1 — Investigación

- **Salida:** `ResearchDossier` (Pydantic)
- **Campos:** `topic`, `news_items[3]`, `suggested_angles`
- **Tool:** Tavily (`basic`, `max_results=3`)

## Task 2 — Redacción

- **Contexto:** `research_task`
- **Reglas:** solo datos del dossier; ~180 palabras

## Task 3 — Edición

- **Contexto:** `write_task` (borrador)
- **Salida:** Markdown con `## Feedback del editor` y `## Post final (LinkedIn)`

## Comparación con LangGraph (prevista)

| CrewAI | LangGraph |
|--------|-----------|
| Contexto de tasks | `State` explícito |
| Secuencia fija | Nodos + aristas condicionales |
| Una pasada del editor | Bucle editor ↔ redactor |
