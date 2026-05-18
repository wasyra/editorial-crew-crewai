import os
import sys
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

load_dotenv(ROOT / ".env")

from src.crew import run_editorial_crew  # noqa: E402

st.set_page_config(
    page_title="Sala editorial CrewAI",
    page_icon="📰",
    layout="wide",
    initial_sidebar_state="expanded",
)

AGENTS_INFO = [
    {
        "name": "Investigador",
        "tool": "Tavily (noticias de la última semana)",
        "entrega": "Dossier con 3 noticias estructuradas",
    },
    {
        "name": "Redactor",
        "tool": "—",
        "entrega": "Borrador del post LinkedIn",
    },
    {
        "name": "Editor",
        "tool": "—",
        "entrega": "Feedback + versión final publicable",
    },
]

TONES = ["profesional", "divulgativo", "inspirador", "directo"]
EXAMPLE_TOPICS = [
    "IA generativa en hospitales",
    "Ciberseguridad en la nube",
    "Regulación de inteligencia artificial en la UE",
]


def _check_env() -> list[str]:
    missing = []
    if not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        missing.append("GEMINI_API_KEY")
    if not os.getenv("TAVILY_API_KEY"):
        missing.append("TAVILY_API_KEY")
    return missing


def _extract_final_post(final_md: str) -> str:
    marker = "## Post final (LinkedIn)"
    if marker in final_md:
        return final_md.split(marker, 1)[1].strip()
    return final_md


with st.sidebar:
    st.header("Equipo de agentes")
    for agent in AGENTS_INFO:
        with st.expander(agent["name"], expanded=False):
            st.markdown(f"**Herramienta:** {agent['tool']}")
            st.markdown(f"**Entrega:** {agent['entrega']}")
    st.divider()
    st.markdown("**Flujo CrewAI**")
    st.code("Process.sequential", language="text")
    st.caption("Investigador → Redactor → Editor")
    st.divider()
    st.markdown("**Salidas guardadas en**")
    st.code("output/", language="text")
st.title("Sala editorial con CrewAI")
st.markdown(
    "Demo multiagente: un **investigador** busca noticias reales, un **redactor** "
    "escribe el borrador y un **editor** entrega la versión final para LinkedIn."
)

st.caption("Ejemplos rápidos:")
example_cols = st.columns(len(EXAMPLE_TOPICS))
for col, example in zip(example_cols, EXAMPLE_TOPICS):
    if col.button(example, use_container_width=True):
        st.session_state.topic_input = example
        st.rerun()

col1, col2 = st.columns([2, 1])
with col1:
    topic = st.text_input(
        "Tema a investigar",
        placeholder="Ej: IA generativa en hospitales",
        help="Será el foco de búsqueda y del post final.",
        key="topic_input",
    )
with col2:
    tone = st.selectbox("Tono del post", TONES)

run = st.button(
    "Generar post con el equipo",
    type="primary",
    disabled=not (topic or "").strip(),
    use_container_width=True,
)

if run:
    missing = _check_env()
    if missing:
        st.error(
            f"Configura estas variables en `.env`: **{', '.join(missing)}**. "
            "Copia desde `.env.example`."
        )
    else:
        progress = st.progress(0, text="Preparando la crew...")
        status = st.empty()

        steps = [
            (15, "Investigador: buscando 3 noticias con Tavily..."),
            (50, "Redactor: escribiendo borrador de LinkedIn..."),
            (85, "Editor: revisando y puliendo versión final..."),
        ]
        for pct, msg in steps:
            progress.progress(pct, text=msg)
            status.info(msg)

        try:
            result = run_editorial_crew(topic=topic.strip(), tone=tone)
            progress.progress(100, text="Completado")
            status.success(
                f"Listo en **{result.elapsed_seconds:.1f}s**. "
                f"Artefactos en `{result.run_dir}`"
            )
            st.session_state["result"] = result
        except Exception as exc:
            progress.empty()
            status.error(f"Error al ejecutar la crew: {exc}")
            st.exception(exc)

if "result" in st.session_state:
    result = st.session_state["result"]

    m1, m2, m3 = st.columns(3)
    m1.metric("Tiempo total", f"{result.elapsed_seconds:.1f}s")
    m2.metric("Agentes", "3")
    m3.metric("Proceso", "Secuencial")

    tab1, tab2, tab3 = st.tabs(
        ["1. Investigación", "2. Borrador", "3. Revisión y final"],
    )
    with tab1:
        st.markdown(result.research)
    with tab2:
        st.markdown(result.draft)
    with tab3:
        st.markdown(result.final)

    final_post = _extract_final_post(result.final)
    st.divider()
    st.subheader("Copiar post final")
    st.text_area("Texto listo para LinkedIn", final_post, height=220)
    st.download_button(
        "Descargar post (.md)",
        data=final_post,
        file_name="linkedin_post.md",
        mime="text/markdown",
        use_container_width=True,
    )
    st.download_button(
        "Descargar informe completo (.md)",
        data=(
            f"# Informe editorial\n\n"
            f"**Tema:** {result.topic}\n**Tono:** {result.tone}\n\n"
            f"## Investigación\n\n{result.research}\n\n"
            f"## Borrador\n\n{result.draft}\n\n"
            f"## Revisión y final\n\n{result.final}\n"
        ),
        file_name="informe_completo.md",
        mime="text/markdown",
        use_container_width=True,
    )

    with st.expander("Salida bruta de la crew"):
        st.markdown(result.raw)
