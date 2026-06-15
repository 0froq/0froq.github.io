#!/usr/bin/env python3
"""Append per-record refactor notes for Corpus migration.

The script is intentionally conservative: it does not rewrite the user's prose.
It appends one collapsible "花花的重构意见" block to each record, using layer-aware
and content-aware heuristics. Re-running updates the block in place.
"""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.S)
TAG_RE = re.compile(r"(?<!\w)#([A-Za-z0-9_\u4e00-\u9fff]+(?:/[A-Za-z0-9_\u4e00-\u9fff]+)*)")
LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
BLOCK_START = "::: details 花花的重构意见"
BLOCK_RE = re.compile(r"\n?::: details 花花的重构意见\n.*?\n:::\n?", re.S)

LAYER_NAMES = {
    "000-autopsia": "Autopsia",
    "100-ingesta": "Ingesta",
    "200-neoplasma": "Neoplasma",
    "300-putredo": "Putredo",
    "400-delirium": "Delirium",
    "500-vigil": "Vigil",
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


def records() -> list[Path]:
    out: list[Path] = []
    for layer in LAYER_NAMES:
        for path in (ROOT / layer).glob("*.md"):
            if path.name != "index.md":
                out.append(path)
    return sorted(out)


def body_stats(body: str) -> tuple[int, int, int]:
    words = len(re.findall(r"[A-Za-z0-9_]+|[\u4e00-\u9fff]", body))
    links = len(LINK_RE.findall(body))
    headings = len(re.findall(r"^##\s+", body, re.M))
    return words, links, headings


def first_heading(body: str) -> str | None:
    match = re.search(r"^##\s+(.+?)\s*$", body, re.M)
    return match.group(1).strip() if match else None


def has_section(body: str, name: str) -> bool:
    return bool(re.search(rf"^##\s+{re.escape(name)}\s*$", body, re.M | re.I))


def note_for(path: Path, text: str) -> str:
    fm, body_start = parse_frontmatter(text)
    body = text[body_start:]
    clean_body = BLOCK_RE.sub("\n", body)
    tags = set(TAG_RE.findall(clean_body))
    words, links, headings = body_stats(clean_body)
    layer = path.parent.name
    status = fm.get("status", "")
    title = fm.get("title", path.stem)
    bullets: list[str] = []

    if layer == "000-autopsia":
        if "origin/ai" in tags or "author/hanako" in tags:
            bullets.append("先补一个 `froQ Verdict`：保留 / 蒸馏 / 反驳 / 暂停，避免 AI 生长枝条直接等同于你的结论。")
            bullets.append("若其中有被确认的判断，拆到 `200 Neoplasma`；本篇只保留系统级诊断和生长过程。")
        else:
            bullets.append("保留为系统自省，但建议把具体行动项拆到 `300 Putredo` 或 dashboard，避免 000 变成任务池。")
        if words > 1800:
            bullets.append("篇幅偏长，可以提炼一个 `## Decision / Mutation` 小节，列出真正改变系统规则的 1–3 条结论。")
        if "capture" in tags:
            bullets.append("这篇仍带 `#capture`，需要判断它是否已经形成系统结论；若是，移除 `#capture` 并补充决策段。")

    elif layer == "100-ingesta":
        bullets.append("保持 source registry 的克制：这里不必补长评，只登记来源、核心元数据和原始摘录。")
        if "source/paper" in tags:
            bullets.append("建议补齐最小论文卡片：研究问题 / 数据与方法 / 关键发现 / 可用于哪条研究线。")
        elif "source/book" in tags:
            bullets.append("书摘可以继续留在这里；真正的判断、类比和回应应拆到 `200 Neoplasma`。")
        if words > 900:
            bullets.append("摘录体量较大，建议扫一遍每个高亮段落，至少拆出 1–3 个 `200` 节点。")
        if links == 0:
            bullets.append("目前几乎没有外链或派生链接；后续 article backlink 做好后，优先检查它是否长出了 200。")
        if "capture" in tags:
            bullets.append("带 `#capture`：这条 source 还只是线索，下一步是补 metadata 或确认是否值得保留。")

    elif layer == "200-neoplasma":
        if "kind/response" in tags:
            bullets.append("这篇现在是 source response。下一步应把其中最强的一句话改写成声明式标题，形成可复用概念节点。")
        else:
            bullets.append("确认它是否能用一句声明式命题概括；如果不能，先保留 `#kind/fragment`。")
        if links == 0:
            bullets.append("建议至少补一个来源、实践或相邻概念链接；200 的价值来自复用和连接。")
        if words > 700:
            bullets.append("篇幅已经接近小文章，考虑拆成多个原子 200，或把它升级为 posts 草稿。")
        if words < 80:
            bullets.append("内容偏短，适合作为 seed；补一段 context，说明它为什么值得未来的你再次打开。")

    elif layer == "300-putredo":
        bullets.append("把它视为现实摩擦记录，不必追求完整叙事；关键是留下可回流的 residue。")
        if not has_section(clean_body, "Residue"):
            bullets.append("建议补 `## Residue`：可蒸馏到 200 / 需要更新 board / 需要进入 000 / 可丢弃噪音。")
        if words > 1000:
            bullets.append("篇幅较长，优先从每个二级标题下抽取一个可复用判断，迁移到 200。")
        if "log/daily" in tags:
            bullets.append("旧 `#log/daily` 可以保留历史语义，但新记录建议用 `#kind/log #origin/practice` 即可。")

    elif layer == "400-delirium":
        bullets.append("保持非理性材料的开放性，不要急着解释。只需补足材料来源和感受。")
        if words < 80:
            bullets.append("可以补两行：它击中的感觉是什么，以及未来可能用于哪类设计 / 写作 / 氛围。")
        if links == 0:
            bullets.append("若它触发了概念判断，再链接到 `200 Neoplasma`；否则保持孤立也可以。")

    elif layer == "500-vigil":
        bullets.append("保留存在锚点的个人性，不要强行知识化。")
        if not has_section(clean_body, "What This Proves") and not has_section(clean_body, "这证明了什么"):
            bullets.append("建议补一个很短的“这证明了什么”：不是总结事件，而是标出身份、选择或生活模式。")
        if words > 900:
            bullets.append("篇幅较长，检查是否有可抽象成 `200` 的概念，尤其是价值判断、工具判断、生活模型。")
        if links == 0:
            bullets.append("若它与旧经历或未来项目有关，补一个横向链接；Vigil 的价值常在多年后的回声。")

    if not bullets:
        bullets.append("当前结构基本可保留；下一步只需在相关节点出现时补链接。")

    heading = first_heading(clean_body)
    context = f"本篇当前层级：`{LAYER_NAMES.get(layer, layer)}`；状态：`{status or 'unknown'}`；约 {words} 个词元，{links} 个链接。"
    if heading:
        context += f" 首个主题段为“{heading}”。"

    lines = [BLOCK_START, "", context, "", "建议："]
    lines.extend(f"- {bullet}" for bullet in bullets[:5])
    lines.append("")
    lines.append(":::")
    return "\n".join(lines)


def main() -> None:
    changed = 0
    for path in records():
        text = path.read_text(encoding="utf-8")
        text_without_old = BLOCK_RE.sub("\n", text).rstrip()
        block = note_for(path, text_without_old)
        new_text = f"{text_without_old}\n\n{block}\n"
        if new_text != text:
            path.write_text(new_text, encoding="utf-8")
            changed += 1
    print(f"refactor_notes_updated={changed}")


if __name__ == "__main__":
    main()
