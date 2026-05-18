# Arquitectura — Sala editorial CrewAI

## Diagrama de flujo

```mermaid
flowchart TB
    subgraph presentation [Capa de presentacion]
        WEB["Next.js VetaUI puerto 3000"]
        ST["Streamlit puerto 8501"]
    end

    subgraph api_layer [API]
        FAST["FastAPI puerto 8001"]
    end

    subgraph orchestration [CrewAI]
        CREW["Crew Process sequential"]
        T1[research_task]
        T2[write_task]
        T3[edit_task]
    end

    subgraph agents [Agentes]
        AG_R[Investigador]
        AG_W[Redactor]
        AG_E[Editor]
    end

    subgraph external [Servicios externos]
        TAV[Tavily API]
        GEM[Google Gemini]
    end

    subgraph persistence [Persistencia]
        OUT["output con timestamp"]
        LOG["logs runs.log"]
    end

    WEB --> FAST
    ST --> CREW
    FAST --> CREW
    CREW --> T1
    T1 --> AG_R
    AG_R --> TAV
    AG_R --> GEM
    T1 --> T2
    T2 --> AG_W
    AG_W --> GEM
    T2 --> T3
    T3 --> AG_E
    AG_E --> GEM
    T3 --> FAST
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
