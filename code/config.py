from __future__ import annotations

import json
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
RANDOM_DIR = ROOT_DIR / "random"
OUTPUT_FILE = Path(__file__).resolve().parent / "manifest.js"

BENCH_ORDER = ["nhr", "rord", "rb", "anime", "text", "omnipaint-p1"]
METHOD_ORDER = [
    "shot",
    "objectclear",
    "omnieraser",
    "omnipaint",
    "flux-t400-alpha",
    "bg",
]

# Replace this with the real anonymous questionnaire URL.
SURVEY_URL = "https://example.com/replace-with-your-anonymous-survey"

# Optional: if the questionnaire supports URL prefill, put the text field
# query parameter name here. Leave empty to use copy-and-paste submission.
# Example: SURVEY_TEXT_PARAM = "answer"
SURVEY_TEXT_PARAM = "answer"


def image_sort_key(path: Path) -> tuple[str, str]:
    return (path.stem, path.suffix.lower())


def web_path(path: Path) -> str:
    return "../" + path.relative_to(ROOT_DIR).as_posix()


def build_manifest() -> dict:
    benches = []

    for bench_name in BENCH_ORDER:
        bench_dir = RANDOM_DIR / bench_name
        if not bench_dir.exists():
            continue

        method_files: dict[str, list[Path]] = {}
        for method in METHOD_ORDER:
            method_dir = bench_dir / method
            if method_dir.exists():
                method_files[method] = sorted(
                    [p for p in method_dir.iterdir() if p.is_file()],
                    key=image_sort_key,
                )[:5]

        row_count = min((len(files) for files in method_files.values()), default=0)
        rows = []
        for index in range(row_count):
            row = []
            for method in METHOD_ORDER:
                path = method_files[method][index]
                row.append(
                    {
                        "method": method,
                        "src": web_path(path),
                        "filename": path.name,
                    }
                )
            rows.append(
                {
                    "index": index + 1,
                    "sourceId": method_files[METHOD_ORDER[0]][index].stem,
                    "images": row,
                }
            )

        benches.append({"name": bench_name, "rows": rows})

    return {
        "surveyUrl": SURVEY_URL,
        "surveyTextParam": SURVEY_TEXT_PARAM,
        "methodOrder": METHOD_ORDER,
        "benches": benches,
    }


def main() -> None:
    manifest = build_manifest()
    js = "window.BENCH_SURVEY_CONFIG = "
    js += json.dumps(manifest, ensure_ascii=False, indent=2)
    js += ";\n"
    OUTPUT_FILE.write_text(js, encoding="utf-8")
    print(f"Wrote {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
