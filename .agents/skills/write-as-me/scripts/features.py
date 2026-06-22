"""Shared stylometric feature library for write-as-me.

Pure stdlib, language-agnostic. Computes objective signal over an author's
*prose* — segmented away from code, quotes, references and tables — plus the
structural habits of their documents. The numbers are two things at once:
evidence for the LLM's interpretation in voice.md, AND the ruler the write-time
linter checks a draft against.

Design rule: compute only what is honestly language-agnostic. Anything that
needs to know what a word *means* (which openers are connectives, whether a
closer "points forward", whether a quote is the author's or a third party's) is
left as RAW MATERIAL for the LLM to interpret — never hardcoded per language.
That keeps the capture portable across authors and languages and keeps the
description/interpretation seam clean.
"""

from __future__ import annotations

import re
import statistics
from collections import Counter
from dataclasses import dataclass, field

# --- tokenizers ------------------------------------------------------------

_FENCE = re.compile(r"^([ \t]*)(`{3,}|~{3,})(.*)$")
_HEADING = re.compile(r"^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$")
_BLOCKQUOTE = re.compile(r"^\s{0,3}>")
_LIST_ITEM = re.compile(r"^\s*([-*+]|\d+[.)])\s+")
_TABLE_ROW = re.compile(r"^\s*\|?.*\|.*$")
_TABLE_SEP = re.compile(r"^\s*\|?[\s:|-]+\|[\s:|-]*$")
_REFERENCES_HEADING = re.compile(
    r"refer[êe]nc|bibliograf|\bsources?\b|\bfontes?\b|further reading", re.IGNORECASE
)

_SENTENCE_SPLIT = re.compile(r"(?<=[.!?…])[\s\)\]\"']*\s")
_WORD = re.compile(r"[^\W\d_][\w'’-]*", re.UNICODE)

_ITALIC = re.compile(r"(?<![*\w])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![*\w])")
_BOLD = re.compile(r"\*\*(?!\s)([^\n]+?)(?<!\s)\*\*")
_CODE_SPAN = re.compile(r"`([^`\n]+?)`")
_LINK = re.compile(r"\[[^\]]+\]\([^)]+\)")


def _round(x, n=2):
    return round(float(x), n) if x is not None else None


# --- segmentation ----------------------------------------------------------


@dataclass
class Segments:
    """One document split by element. Prose is the only thing prose-metrics run on."""

    paragraphs: list[str] = field(default_factory=list)  # author's connective prose
    list_items: list[str] = field(default_factory=list)
    headings: list[tuple[int, str]] = field(default_factory=list)  # (level, text)
    code_blocks: list[str] = field(default_factory=list)
    code_langs: list[str] = field(default_factory=list)
    blockquotes: list[str] = field(default_factory=list)
    table_rows: list[str] = field(default_factory=list)
    references_block: str = ""
    has_references_section: bool = False


def segment_markdown(text: str) -> Segments:
    """Split a markdown document into elements.

    Code fences are pulled first so their contents never pollute prose. Then a
    line walk classifies headings, blockquotes, tables and lists; whatever is
    left and contiguous is a prose paragraph. A trailing references-style
    section is detected by heading and excluded from prose.
    """
    seg = Segments()
    lines = text.splitlines()

    # 1) pull fenced code blocks
    body: list[str] = []
    i = 0
    while i < len(lines):
        m = _FENCE.match(lines[i])
        if m:
            fence = m.group(2)[0]
            lang = m.group(3).strip()
            block: list[str] = []
            i += 1
            while i < len(lines) and not (
                lines[i].lstrip().startswith(fence * 3)
                and not lines[i].lstrip()[3:].strip().startswith(fence)
            ):
                block.append(lines[i])
                i += 1
            i += 1  # consume closing fence
            seg.code_blocks.append("\n".join(block))
            seg.code_langs.append(lang or "")
            body.append("\x00CODE\x00")  # placeholder keeps paragraph breaks honest
            continue
        body.append(lines[i])
        i += 1

    # 2) find a references section (heading + everything to next same/higher heading)
    ref_start = None
    ref_level = None
    for idx, line in enumerate(body):
        hm = _HEADING.match(line)
        if hm and _REFERENCES_HEADING.search(hm.group(2)):
            ref_start = idx
            ref_level = len(hm.group(1))
            break
    ref_range: set[int] = set()
    if ref_start is not None:
        seg.has_references_section = True
        end = len(body)
        for idx in range(ref_start + 1, len(body)):
            hm = _HEADING.match(body[idx])
            if hm and len(hm.group(1)) <= ref_level:
                end = idx
                break
        ref_range = set(range(ref_start, end))
        seg.references_block = "\n".join(body[ref_start:end])

    # 3) classify remaining lines; gather contiguous prose into paragraphs
    para: list[str] = []

    def flush():
        if para:
            joined = " ".join(s.strip() for s in para).strip()
            if joined and joined != "\x00CODE\x00":
                seg.paragraphs.append(joined)
        para.clear()

    for idx, raw in enumerate(body):
        if idx in ref_range:
            continue
        line = raw.rstrip()
        if not line.strip():
            flush()
            continue
        if line.strip() == "\x00CODE\x00":
            flush()
            continue
        hm = _HEADING.match(line)
        if hm:
            flush()
            seg.headings.append((len(hm.group(1)), hm.group(2).strip()))
            continue
        if _BLOCKQUOTE.match(line):
            flush()
            seg.blockquotes.append(re.sub(r"^\s*>\s?", "", line))
            continue
        if _TABLE_SEP.match(line) or (
            "|" in line and line.count("|") >= 2 and _TABLE_ROW.match(line)
        ):
            flush()
            seg.table_rows.append(line.strip())
            continue
        if _LIST_ITEM.match(line):
            flush()
            seg.list_items.append(_LIST_ITEM.sub("", line).strip())
            continue
        para.append(line)
    flush()
    return seg


# --- prose metrics ---------------------------------------------------------


def _split_sentences(paragraph: str) -> list[str]:
    parts = _SENTENCE_SPLIT.split(paragraph.strip())
    return [p.strip() for p in parts if p.strip()]


def _words(text: str) -> list[str]:
    return _WORD.findall(text)


def _per_1k(count: int, total_words: int) -> float | None:
    if not total_words:
        return None
    return _round(count / total_words * 1000)


def _dist(values: list[float]) -> dict:
    if not values:
        return {"n": 0}
    vs = sorted(values)
    return {
        "n": len(vs),
        "mean": _round(statistics.fmean(vs)),
        "median": _round(statistics.median(vs)),
        "stdev": _round(statistics.pstdev(vs)) if len(vs) > 1 else 0.0,
        "p10": _round(vs[int(0.10 * (len(vs) - 1))]),
        "p90": _round(vs[int(0.90 * (len(vs) - 1))]),
        "max": _round(vs[-1]),
    }


def prose_metrics(paragraphs: list[str]) -> dict:
    """Objective signal over connective prose only. The heart of the ruler."""
    full = "\n\n".join(paragraphs)
    words = _words(full)
    n_words = len(words)

    sent_lengths: list[int] = []
    para_sent_counts: list[int] = []
    para_word_counts: list[int] = []
    questions = 0
    initial_tokens: Counter = Counter()

    for p in paragraphs:
        sents = _split_sentences(p)
        para_sent_counts.append(len(sents))
        para_word_counts.append(len(_words(p)))
        for s in sents:
            sw = _words(s)
            if not sw:
                continue
            sent_lengths.append(len(sw))
            initial_tokens[sw[0].lower()] += 1
            if s.rstrip().endswith("?"):
                questions += 1

    n_sent = len(sent_lengths)
    return {
        "prose_words": n_words,
        "paragraphs": len(paragraphs),
        "sentences": n_sent,
        "sentence_length_words": _dist([float(x) for x in sent_lengths]),
        "paragraph_length_sentences": _dist([float(x) for x in para_sent_counts]),
        "paragraph_length_words": _dist([float(x) for x in para_word_counts]),
        "question_rate": _round(questions / n_sent) if n_sent else None,
        "punctuation_per_1k": {
            "em_dash": _per_1k(full.count("—"), n_words),
            "en_dash": _per_1k(full.count("–"), n_words),
            "double_hyphen": _per_1k(len(re.findall(r"(?<!-)--(?!-)", full)), n_words),
            "comma": _per_1k(full.count(","), n_words),
            "semicolon": _per_1k(full.count(";"), n_words),
            "colon": _per_1k(full.count(":"), n_words),
            "parens": _per_1k(full.count("("), n_words),
        },
        "emphasis_per_1k": {
            "italic": _per_1k(len(_ITALIC.findall(full)), n_words),
            "bold": _per_1k(len(_BOLD.findall(full)), n_words),
            "code_span": _per_1k(len(_CODE_SPAN.findall(full)), n_words),
            "link": _per_1k(len(_LINK.findall(full)), n_words),
        },
        # RAW MATERIAL — for the LLM to interpret, not a verdict on its own:
        "sentence_initial_tokens_top": initial_tokens.most_common(15),
    }


# --- structural metrics ----------------------------------------------------


def structure_metrics(seg: Segments) -> dict:
    prose_words = len(_words("\n\n".join(seg.paragraphs)))
    code_lines = sum(b.count("\n") + 1 for b in seg.code_blocks if b.strip())
    heading_levels = [lvl for lvl, _ in seg.headings]
    return {
        "headings": len(seg.headings),
        "heading_level_hist": dict(Counter(heading_levels)),
        "code_blocks": len(seg.code_blocks),
        "code_lines": code_lines,
        "code_langs": dict(Counter(l for l in seg.code_langs if l)),
        "code_to_prose_ratio": _round(code_lines / prose_words, 4) if prose_words else None,
        "blockquotes": len(seg.blockquotes),
        "table_rows": len(seg.table_rows),
        "list_items": len(seg.list_items),
        "has_references_section": seg.has_references_section,
    }


def analyze_document(text: str) -> dict:
    """Full per-document feature record, including raw opener/closer material."""
    seg = segment_markdown(text)
    prose = prose_metrics(seg.paragraphs)
    structure = structure_metrics(seg)

    first_sentence = ""
    last_sentence = ""
    if seg.paragraphs:
        fs = _split_sentences(seg.paragraphs[0])
        ls = _split_sentences(seg.paragraphs[-1])
        first_sentence = fs[0] if fs else ""
        last_sentence = ls[-1] if ls else ""

    return {
        "prose": prose,
        "structure": structure,
        # RAW MATERIAL the LLM interprets into opener/closer taxonomy:
        "opener": first_sentence[:400],
        "closer": last_sentence[:400],
        "headings_sample": [t for _, t in seg.headings][:25],
    }
