#!/usr/bin/env python3
"""Migrate Corpus records to the ecosystem/tag protocol.

- Adds #kind / #origin tags by layer.
- Keeps only one lightweight capture marker: #capture.
- Preserves existing meaningful hashtags.
- Removes empty placeholder tags (#scope/, #source/, #collection/) and old #state/* tags.
- Repairs common pre-2026 underscore-style relative links when a matching target exists.
"""

from __future__ import annotations

from pathlib import Path
import os
import re
import unicodedata
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.S)
TAG_TOKEN_RE = re.compile(r"(?<!\w)#([A-Za-z0-9_\u4e00-\u9fff]+(?:/[A-Za-z0-9_\u4e00-\u9fff]+)*)")
TAG_LINE_RE = re.compile(r"^\s*(?:#[A-Za-z0-9_\u4e00-\u9fff]+(?:/[A-Za-z0-9_\u4e00-\u9fff]+)*\s*)+$")
MD_LINK_RE = re.compile(r"(?<!!)\[([^\]]+)\]\(([^)]+\.md(?:#[^)]+)?)\)")
PLACEHOLDER_TAGS = {"scope", "source", "collection"}
OLD_STATE_TAGS = {"state/capture", "state/seed", "state/probe", "state/form", "state/distilled", "state/void"}

LAYER_RULES = {
    "000-autopsia": ["kind/reflection"],
    "100-ingesta": ["kind/source", "origin/external"],
    "200-neoplasma": ["kind/fragment"],
    "300-putredo": ["kind/log", "origin/practice"],
    "400-delirium": ["kind/aesthetic", "origin/aesthetic"],
    "500-vigil": ["kind/vigil", "origin/memory"],
}

LAYER_DIR_REPLACEMENTS = {
    "000_autopsia": "000-autopsia",
    "100_ingesta": "100-ingesta",
    "200_neoplasma": "200-neoplasma",
    "300_putredo": "300-putredo",
    "400_delirium": "400-delirium",
    "500_vigil": "500-vigil",
    "610_log": "610-log",
    "620_roadmap": "620-roadmap",
    "630_collection": "630-collection",
}


def parse_frontmatter(text: str) -> tuple[dict[str, str], int]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, 0
    data: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" in line and not line.startswith(" "):
            key, value = line.split(":", 1)
            data[key.strip()] = value.strip().strip("'\"")
    return data, match.end()


def normalise_key(value: str) -> str:
    value = unquote(value)
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return value.lower().replace("_", "-")


def build_path_index() -> dict[str, list[Path]]:
    index: dict[str, list[Path]] = {}
    for path in ROOT.rglob("*.md"):
        rel = path.relative_to(ROOT)
        if "_template" in rel.parts or "_config" in rel.parts:
            continue
        index.setdefault(normalise_key(path.stem), []).append(path)
    return index


PATH_INDEX = build_path_index()


def corpus_records() -> list[Path]:
    records: list[Path] = []
    for layer in LAYER_RULES:
        for path in (ROOT / layer).glob("*.md"):
            if path.name != "index.md":
                records.append(path)
    return sorted(records)


def get_layer(path: Path) -> str | None:
    rel = path.relative_to(ROOT)
    return rel.parts[0] if rel.parts else None


def infer_tags(path: Path, body: str, existing: set[str]) -> list[str]:
    layer = get_layer(path)
    tags = list(LAYER_RULES.get(layer or "", []))

    if layer == "000-autopsia":
        if "author/hanako" in existing or "source/ai" in existing or "本文由 AI" in body:
            tags.append("origin/ai")
        else:
            tags.append("origin/endogenous")
        if "scope/meta/corpus" in existing or "corpus" in path.stem or "Corpus" in body[:1200]:
            tags.append("scope/meta/corpus")

    elif layer == "100-ingesta":
        if path.name.startswith("ing-@") or "source/paper" in existing or "citation_key:" in body:
            tags.append("source/paper")
        elif "source/book" in existing or any(x in path.stem for x in ["room", "peste", "etranger", "moon", "sisyphe", "psychoanalyse"]):
            tags.append("source/book")

    elif layer == "200-neoplasma":
        if "[source]" in body.lower() or "source/book" in existing or "source/paper" in existing:
            tags[0] = "kind/response"
            tags.append("origin/external")
        else:
            tags.append("origin/endogenous")

    elif layer == "300-putredo":
        if "research" in path.stem or "scope/work/research" in existing:
            tags.append("practice/research")
        if "refactor" in existing:
            tags.append("practice/refactor")

    return tags


def ordered_merge(primary: list[str], existing: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    primary_namespaces = {tag.split("/", 1)[0] for tag in primary if "/" in tag}
    controlled_namespaces = {"kind", "origin"}
    for tag in primary + existing:
        tag = tag.strip("# ")
        if not tag or tag in PLACEHOLDER_TAGS or tag.endswith("/") or tag in OLD_STATE_TAGS:
            continue
        namespace = tag.split("/", 1)[0] if "/" in tag else ""
        if tag not in primary and namespace in controlled_namespaces and namespace in primary_namespaces:
            continue
        if tag in seen:
            continue
        seen.add(tag)
        result.append(tag)
    return result


def repair_links(path: Path, text: str) -> tuple[str, int]:
    count = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal count
        label, href = match.group(1), match.group(2)
        if href.startswith(("http://", "https://", "mailto:")):
            return match.group(0)
        anchor = ""
        base = href
        if "#" in href:
            base, anchor = href.split("#", 1)
            anchor = f"#{anchor}"

        candidate_href = base
        for old, new in LAYER_DIR_REPLACEMENTS.items():
            candidate_href = candidate_href.replace(old, new)
        candidate_href = candidate_href.replace("_", "-")

        current_target = (path.parent / unquote(candidate_href)).resolve()
        if current_target.exists():
            if candidate_href != base:
                count += 1
                return f"[{label}]({candidate_href}{anchor})"
            return match.group(0)

        stem_key = normalise_key(Path(candidate_href).stem)
        candidates = PATH_INDEX.get(stem_key, [])
        if not candidates:
            candidates = [p for key, ps in PATH_INDEX.items() if stem_key.startswith(key) for p in ps]
        if not candidates:
            if candidate_href != base:
                count += 1
                return f"[{label}]({candidate_href}{anchor})"
            return match.group(0)

        target = candidates[0]
        new_href = Path(os.path.relpath(target, path.parent)).as_posix()
        count += 1
        return f"[{label}]({new_href}{anchor})"

    return MD_LINK_RE.sub(repl, text), count


def migrate_file(path: Path) -> tuple[bool, int]:
    text = path.read_text(encoding="utf-8")
    _fm, body_start = parse_frontmatter(text)
    head = text[:body_start]
    body = text[body_start:]

    body, link_repairs = repair_links(path, body)
    all_existing = TAG_TOKEN_RE.findall(body)

    lines = body.splitlines()
    tag_line_index: int | None = None
    tag_line_indices: list[int] = []
    primary_existing: list[str] = []

    for idx in range(min(len(lines), 40)):
        if TAG_LINE_RE.match(lines[idx]):
            tag_line_index = idx
            j = idx
            while j < len(lines) and (TAG_LINE_RE.match(lines[j]) or lines[j].strip() == ""):
                if TAG_LINE_RE.match(lines[j]):
                    tag_line_indices.append(j)
                    primary_existing.extend(TAG_TOKEN_RE.findall(lines[j]))
                if lines[j].strip() == "" and (j + 1 >= len(lines) or not TAG_LINE_RE.match(lines[j + 1])):
                    break
                j += 1
            break

    existing_set = set(all_existing)
    inferred = infer_tags(path, body, existing_set)
    merged_tags = ordered_merge(inferred, primary_existing)
    tag_line = " ".join(f"#{tag}" for tag in merged_tags)

    if tag_line_index is not None:
        lines[tag_line_index] = tag_line
        for idx in reversed(tag_line_indices[1:]):
            del lines[idx]
    else:
        insert_at = 0
        for idx, line in enumerate(lines[:30]):
            if line.strip() == "[[toc]]":
                insert_at = idx + 1
                break
        else:
            for idx, line in enumerate(lines[:10]):
                if line.strip() == "---":
                    insert_at = idx + 1
                    break
        lines.insert(insert_at, "")
        lines.insert(insert_at + 1, tag_line)

    new_body = "\n".join(lines)
    if body.endswith("\n"):
        new_body += "\n"
    new_text = head + new_body

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        return True, link_repairs
    return False, link_repairs


def main() -> None:
    changed = 0
    links = 0
    for path in corpus_records():
        did_change, link_count = migrate_file(path)
        changed += int(did_change)
        links += link_count
    print(f"migrated_files={changed}")
    print(f"repaired_links={links}")


if __name__ == "__main__":
    main()
