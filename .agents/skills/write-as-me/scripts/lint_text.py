#!/usr/bin/env python3
"""Lint a draft against a captured voice's features.json.

This is the objective guard-rail at write-time: it recomputes the same prose
metrics on a freshly generated draft and compares the voice-critical ones to
the author's baseline. It is NECESSARY, NOT SUFFICIENT — matching the numbers
doesn't make a text sound like the author, but drifting far from them is a
reliable smell (the classic case: an em-dash rate the author never uses). Treat
a flag as "look here", not "wrong".

Usage:
    python lint_text.py --features features.json DRAFT.md
    cat draft.md | python lint_text.py --features features.json -
    python lint_text.py --features features.json DRAFT.md --json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import features as F  # noqa: E402

_FRONTMATTER = re.compile(r"^﻿?---\n.*?\n---\n", re.DOTALL)

# (dotted path, label, kind, param)
#   ratio    : ok when |draft/base - 1| <= param          (proportional habits)
#   ratio_abs: ok when |draft - base| <= param            (already a fraction)
#   ceiling  : param=(mult, margin); ok when draft <= max(base*mult, base+margin)
CHECKS = [
    ("prose.sentence_length_words.mean", "Comprimento médio de frase (palavras)", "ratio", 0.30),
    ("prose.paragraph_length_words.mean", "Comprimento médio de parágrafo (palavras)", "ratio", 0.45),
    ("prose.question_rate", "Taxa de perguntas retóricas", "ratio_abs", 0.06),
    ("prose.punctuation_per_1k.em_dash", "Em-dash por 1k palavras", "ceiling", (1.5, 1.0)),
    ("prose.punctuation_per_1k.en_dash", "En-dash por 1k palavras", "ceiling", (1.5, 1.0)),
    ("prose.punctuation_per_1k.comma", "Vírgulas por 1k", "ratio", 0.35),
    ("prose.punctuation_per_1k.colon", "Dois-pontos por 1k", "ratio", 0.55),
    ("prose.punctuation_per_1k.semicolon", "Ponto-e-vírgula por 1k", "ceiling", (2.0, 2.0)),
    ("prose.emphasis_per_1k.italic", "Itálico por 1k", "ratio", 0.60),
    ("prose.emphasis_per_1k.bold", "Negrito por 1k", "ratio", 0.60),
    ("prose.emphasis_per_1k.code_span", "Code spans por 1k", "ratio", 0.60),
]


def strip_frontmatter(text: str) -> str:
    return _FRONTMATTER.sub("", text, count=1)


def dig(obj: dict, path: str):
    cur = obj
    for key in path.split("."):
        if not isinstance(cur, dict) or key not in cur:
            return None
        cur = cur[key]
    return cur


def evaluate(base, draft, kind, param):
    """Return (verdict, detail). verdict in {ok, drift, n/a}."""
    if base is None or draft is None:
        return "n/a", "sem dado"
    if kind == "ratio":
        if base == 0:
            return ("ok", "base 0") if draft <= 1.0 else ("drift", "base 0, rascunho alto")
        delta = draft / base - 1
        return ("drift" if abs(delta) > param else "ok", f"{delta:+.0%}")
    if kind == "ratio_abs":
        return ("drift" if abs(draft - base) > param else "ok", f"{draft - base:+.3f}")
    if kind == "ceiling":
        mult, margin = param
        cap = max(base * mult, base + margin)
        return ("drift" if draft > cap else "ok", f"teto {cap:.2f}")
    return "n/a", "?"


def lint(draft_text: str, baseline: dict) -> list[dict]:
    seg = F.segment_markdown(strip_frontmatter(draft_text))
    draft = {"prose": F.prose_metrics(seg.paragraphs)}
    rows = []
    for path, label, kind, param in CHECKS:
        base = dig(baseline, path)
        d = dig(draft, path)
        verdict, detail = evaluate(base, d, kind, param)
        rows.append(
            {"label": label, "path": path, "base": base, "draft": d, "verdict": verdict, "detail": detail}
        )
    return rows


def render_table(rows: list[dict]) -> str:
    out = []
    out.append(f"{'Métrica':40} {'Autor':>8} {'Rascunho':>9}  Veredito")
    out.append("-" * 78)
    for r in rows:
        base = "—" if r["base"] is None else f"{r['base']:.2f}"
        draft = "—" if r["draft"] is None else f"{r['draft']:.2f}"
        mark = {"ok": "ok", "drift": "DRIFT", "n/a": "n/a"}[r["verdict"]]
        out.append(f"{r['label']:40} {base:>8} {draft:>9}  {mark:5} ({r['detail']})")
    drifts = sum(1 for r in rows if r["verdict"] == "drift")
    out.append("-" * 78)
    out.append(
        f"{drifts} desvio(s). Guard-rail necessário, não suficiente: confira os DRIFT, "
        f"mas o juiz de voz e você decidem se soa como o autor."
    )
    return "\n".join(out)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("draft", help="draft file, or - for stdin")
    ap.add_argument("--features", required=True, help="path to the captured voice's features.json")
    ap.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    args = ap.parse_args()

    baseline = json.loads(Path(args.features).expanduser().read_text(encoding="utf-8"))
    draft_text = sys.stdin.read() if args.draft == "-" else Path(args.draft).read_text(encoding="utf-8")
    rows = lint(draft_text, baseline)

    if args.json:
        drifts = [r for r in rows if r["verdict"] == "drift"]
        print(json.dumps({"rows": rows, "drift_count": len(drifts)}, ensure_ascii=False, indent=2))
    else:
        print(render_table(rows))


if __name__ == "__main__":
    main()
