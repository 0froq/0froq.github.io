#!/usr/bin/env python3
"""Migrate all Corpus tags to flat system.

Removes:
  #kind/*  → flattened (claim, model, design, question, fragment, response, growth)
              or removed when directory already says it (source, log, reflection, aesthetic, vigil)
  #origin/* → #inner / #outer
  #source/* → #paper, #book, #article, #podcast, #video (flattened)
              #source/ai → removed (expressed via #outer)
"""

from __future__ import annotations
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TAG_TOKEN_RE = re.compile(r"(?<!\w)#([A-Za-z0-9_\u4e00-\u9fff]+(?:/[A-Za-z0-9_\u4e00-\u9fff]+)*)")
TAG_LINE_RE = re.compile(r"^\s*(?:#[A-Za-z0-9_/\u4e00-\u9fff]+\s*)+$")

# --- Mapping tables ---

# kind → flat or None (remove)
KIND_MAP = {
    "kind/claim": "claim",
    "kind/model": "model",
    "kind/design": "design",
    "kind/question": "question",
    "kind/fragment": "fragment",
    "kind/response": "response",
    "kind/growth": "growth",
    # Removed (directory says it):
    "kind/source": None,
    "kind/log": None,
    "kind/reflection": None,
    "kind/aesthetic": None,
    "kind/vigil": None,
    "kind/material": None,
    "kind/practice": None,
}

# origin → inner/outer
ORIGIN_MAP = {
    "origin/external": "outer",
    "origin/endogenous": "inner",
    "origin/practice": "inner",
    "origin/dialogue": "inner",
    "origin/ai": "outer",
    "origin/aesthetic": "inner",
    "origin/memory": "inner",
    "origin/experience": "inner",
}

# source → flat or None
SOURCE_MAP = {
    "source/paper": "paper",
    "source/book": "book",
    "source/article": "article",
    "source/podcast": "podcast",
    "source/video": "video",
    "source/song": "song",
    "source/image": "image",
    "source/documentation": "documentation",
    # Removed (expressed via #outer):
    "source/ai": None,
}


def transform_tag(raw: str) -> str | None:
    """Return new tag string or None to drop."""
    tag = raw.strip("# ").rstrip("/")
    if not tag:
        return None

    # origin/* → inner/outer
    if tag.startswith("origin/"):
        # Special: origin/corpus/<layer> → inner
        if tag.startswith("origin/corpus/"):
            return "inner"
        return ORIGIN_MAP.get(tag)

    # kind/* → flat or None
    if tag.startswith("kind/"):
        return KIND_MAP.get(tag)

    # source/* → flat or None
    if tag.startswith("source/"):
        return SOURCE_MAP.get(tag)

    # state/* → drop entirely (deprecated)
    if tag.startswith("state/"):
        return None

    # Keep as-is: scope/*, author/*, practice/*, capture, thought, log/daily, etc.
    if tag.endswith("/"):
        return None
    return tag


def process_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    changed = False

    new_lines = []
    for idx, line in enumerate(lines[:60]):  # Only process top 60 lines
        if TAG_LINE_RE.match(line):
            tags = TAG_TOKEN_RE.findall(line)
            new_tags = []
            seen = set()
            for t in tags:
                mapped = transform_tag(t)
                if mapped is None:
                    continue
                if mapped in seen:
                    continue
                seen.add(mapped)
                new_tags.append(mapped)
            new_line = " ".join(f"#{t}" for t in new_tags)
            if new_line != line:
                changed = True
            new_lines.append(new_line)
        else:
            new_lines.append(line)

    if not changed:
        return False

    # The rest of the file unchanged
    new_lines.extend(lines[60:])
    path.write_text("\n".join(new_lines), encoding="utf-8")
    return True


def main() -> None:
    changed = 0
    for path in sorted(ROOT.rglob("*.md")):
        rel = path.relative_to(ROOT)
        if "_template" in rel.parts or "_config" in rel.parts or "en/" in rel.parts:
            continue
        if process_file(path):
            changed += 1
    print(f"migrated_files={changed}")


if __name__ == "__main__":
    main()
