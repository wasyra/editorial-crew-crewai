"""CLI: python main.py "tu tema" [--tone profesional]"""

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
load_dotenv(ROOT / ".env")

from src.crew import run_editorial_crew  # noqa: E402

TONES = ["profesional", "divulgativo", "inspirador", "directo"]


def main() -> None:
    parser = argparse.ArgumentParser(description="Sala editorial CrewAI")
    parser.add_argument("topic", help="Tema a investigar y redactar")
    parser.add_argument("--tone", default="profesional", choices=TONES)
    args = parser.parse_args()

    print(f"\nTema: {args.topic} | Tono: {args.tone}\n")
    result = run_editorial_crew(topic=args.topic, tone=args.tone)

    print("\n=== INVESTIGACIÓN ===\n")
    print(result.research)
    print("\n=== BORRADOR ===\n")
    print(result.draft)
    print("\n=== REVISIÓN Y FINAL ===\n")
    print(result.final)


if __name__ == "__main__":
    main()
