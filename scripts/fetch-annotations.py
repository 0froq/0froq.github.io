#!/usr/bin/env python3
"""Fetch Rune annotation feedback from public GitHub Discussions.

The blog stores each annotation as a JSON Discussion comment. This reader is
intentionally read-only and accepts feedback from the blog owner only.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

OWNER = "0froq"
REPO = "0froq.github.io"
API_ROOT = f"https://api.github.com/repos/{OWNER}/{REPO}/discussions"
PAGE_MARKER = "<!-- annotation-page: "
HEADERS = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "rune-annotation-feedback/1.0",
    "X-GitHub-Api-Version": "2022-11-28",
}


def get_json(url: str) -> list[object] | dict[str, object]:
    request = Request(url, headers=HEADERS)
    with urlopen(request, timeout=20) as response:  # noqa: S310 -- fixed GitHub API origin
        return json.load(response)


def paged(url: str) -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    for page in range(1, 11):
        separator = "&" if "?" in url else "?"
        result = get_json(f"{url}{separator}{urlencode({'per_page': 100, 'page': page})}")
        if not isinstance(result, list):
            raise ValueError("GitHub API returned an unexpected non-list response")
        batch = [item for item in result if isinstance(item, dict)]
        items.extend(batch)
        if len(batch) < 100:
            break
    return items


def parse_marker(body: object) -> str | None:
    if not isinstance(body, str):
        return None
    start = body.find(PAGE_MARKER)
    if start < 0:
        return None
    start += len(PAGE_MARKER)
    end = body.find(" -->", start)
    return body[start:end] if end >= start else None


def parse_annotation(comment: dict[str, object], page_path: str, discussion: dict[str, object], parent_id: int | None) -> dict[str, object] | None:
    user = comment.get("user")
    if not isinstance(user, dict) or user.get("login") != OWNER:
        return None
    body = comment.get("body")
    if not isinstance(body, str):
        return None
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return None
    if not isinstance(data, dict) or data.get("version") != 1 or not isinstance(data.get("text"), str):
        return None
    # The Discussion marker is authoritative for page identity. A mismatched
    # payload is rejected rather than allowing a crafted comment to redirect Rune.
    if data.get("pagePath") != page_path or "anchor" not in data:
        return None
    created_at = comment.get("created_at")
    if not isinstance(created_at, str):
        return None
    return {
        "commentId": comment.get("node_id") or comment.get("id"),
        "parentCommentId": parent_id,
        "pagePath": page_path,
        "anchor": data["anchor"],
        "text": data["text"],
        "createdAt": created_at,
        "url": comment.get("html_url"),
        "discussion": {
            "number": discussion.get("number"),
            "title": discussion.get("title"),
            "url": discussion.get("html_url"),
        },
    }


def parse_github_time(value: object) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def fetch_annotations(since: datetime) -> list[dict[str, object]]:
    annotations: list[dict[str, object]] = []
    discussions = paged(f"{API_ROOT}?direction=desc")
    for discussion in discussions:
        page_path = parse_marker(discussion.get("body"))
        number = discussion.get("number")
        if not page_path or not isinstance(number, int):
            continue
        comments = paged(f"{API_ROOT}/{number}/comments")
        for comment in comments:
            created_at = parse_github_time(comment.get("created_at"))
            if created_at and created_at >= since:
                annotation = parse_annotation(comment, page_path, discussion, None)
                if annotation:
                    annotations.append(annotation)
            comment_id = comment.get("id")
            if not isinstance(comment_id, int) or not comment.get("child_comment_count"):
                continue
            for reply in paged(f"{API_ROOT}/comments/{comment_id}/replies"):
                reply_created_at = parse_github_time(reply.get("created_at"))
                if reply_created_at and reply_created_at >= since:
                    annotation = parse_annotation(reply, page_path, discussion, comment_id)
                    if annotation:
                        annotations.append(annotation)
    return sorted(annotations, key=lambda item: str(item["createdAt"]))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--since-hours", type=float, default=24)
    args = parser.parse_args()
    if args.since_hours <= 0:
        parser.error("--since-hours must be positive")

    now = datetime.now(timezone.utc)
    since = now - timedelta(hours=args.since_hours)
    annotations: list[dict[str, object]] = []
    result: dict[str, object] = {
        "status": "ok",
        "author": OWNER,
        "since": since.isoformat(),
        "retrievedAt": now.isoformat(),
        "annotations": annotations,
    }
    try:
        annotations = fetch_annotations(since)
        result["annotations"] = annotations
    except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
        result["status"] = "unknown"
        result["error"] = str(exc)

    result["count"] = len(annotations)
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
