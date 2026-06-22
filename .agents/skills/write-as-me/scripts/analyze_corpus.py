#!/usr/bin/env python3
"""Analyze a corpus of an author's writing into features.json.

This is the objective layer of a captured voice. It pools the author's prose
across every document and computes stable distributions, plus per-document
structural habits and raw opener/closer material. The LLM reads this JSON and
interprets it into anchored voice claims (voice.md) — the script never
editorializes, it only measures.

Usage:
    python analyze_corpus.py PATH [PATH ...] [--out features.json]

PATH may be a file or a directory (recursed for .md/.mdx/.markdown/.txt).
Pure stdlib; no install required.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import features as F  # noqa: E402

EXTS = {".md", ".mdx", ".markdown", ".txt", ".text"}
_FRONTMATTER = re.compile(r"^﻿?---\n.*?\n---\n", re.DOTALL)


def strip_frontmatter(text: str) -> str:
    return _FRONTMATTER.sub("", text, count=1)


def gather_files(paths: list[str]) -> list[Path]:
    files: list[Path] = []
    for p in paths:
        path = Path(p).expanduser()
        if path.is_dir():
            files += [f for f in sorted(path.rglob("*")) if f.suffix.lower() in EXTS]
        elif path.is_file():
            files.append(path)
        else:
            print(f"warning: skipping missing path {path}", file=sys.stderr)
    return files


def analyze(paths: list[str]) -> dict:
    files = gather_files(paths)
    if not files:
        raise SystemExit("no input files found")

    pooled_paragraphs: list[str] = []
    n_with_refs = 0
    n_with_tables = 0
    n_with_quotes = 0
    code_ratios: list[float] = []
    heading_levels: Counter = Counter()
    code_langs: Counter = Counter()
    openers: list[dict] = []
    closers: list[dict] = []
    headings_pool: list[str] = []
    per_doc: list[dict] = []

    for f in files:
        try:
            text = strip_frontmatter(f.read_text(encoding="utf-8", errors="replace"))
        except Exception as e:  # noqa: BLE001
            print(f"warning: could not read {f}: {e}", file=sys.stderr)
            continue
        seg = F.segment_markdown(text)
        pooled_paragraphs.extend(seg.paragraphs)
        st = F.structure_metrics(seg)
        n_with_refs += int(st["has_references_section"])
        n_with_tables += int(st["table_rows"] > 0)
        n_with_quotes += int(st["blockquotes"] > 0)
        if st["code_to_prose_ratio"] is not None:
            code_ratios.append(st["code_to_prose_ratio"])
        heading_levels.update({int(k): v for k, v in st["heading_level_hist"].items()})
        code_langs.update(st["code_langs"])
        headings_pool.extend(h for _, h in seg.headings)

        doc = F.analyze_document(text)
        if doc["opener"]:
            openers.append({"file": f.name, "text": doc["opener"]})
        if doc["closer"]:
            closers.append({"file": f.name, "text": doc["closer"]})
        per_doc.append(
            {
                "file": f.name,
                "prose_words": doc["prose"]["prose_words"],
                "code_to_prose_ratio": st["code_to_prose_ratio"],
                "has_references_section": st["has_references_section"],
            }
        )

    n = len(files)
    corpus_prose = F.prose_metrics(pooled_paragraphs)
    mean_code_ratio = round(sum(code_ratios) / len(code_ratios), 4) if code_ratios else None

    return {
        "meta": {
            "tool": "write-as-me/analyze_corpus",
            "schema": 1,
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "documents": n,
            "total_prose_words": corpus_prose["prose_words"],
            "sources": [f.name for f in files],
        },
        "prose": corpus_prose,
        "structure": {
            "references_section_rate": round(n_with_refs / n, 3) if n else None,
            "table_usage_rate": round(n_with_tables / n, 3) if n else None,
            "blockquote_usage_rate": round(n_with_quotes / n, 3) if n else None,
            "mean_code_to_prose_ratio": mean_code_ratio,
            "heading_level_hist": dict(sorted(heading_levels.items())),
            "code_langs": dict(code_langs.most_common()),
        },
        # RAW MATERIAL — the LLM interprets these into opener/closer/heading
        # taxonomies and connective vocabulary. Numbers above are evidence;
        # these strings are the texture.
        "raw_material": {
            "openers": openers[:60],
            "closers": closers[:60],
            "headings_sample": headings_pool[:120],
            "sentence_initial_tokens_top": corpus_prose["sentence_initial_tokens_top"],
        },
        "per_document": per_doc,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("paths", nargs="+", help="files or directories of the author's writing")
    ap.add_argument("--out", default=None, help="write JSON here (default: stdout)")
    args = ap.parse_args()

    result = analyze(args.paths)
    payload = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).expanduser().write_text(payload + "\n", encoding="utf-8")
        m = result["meta"]
        print(
            f"wrote {args.out}: {m['documents']} docs, {m['total_prose_words']} prose words",
            file=sys.stderr,
        )
    else:
        print(payload)


if __name__ == "__main__":
    main()
