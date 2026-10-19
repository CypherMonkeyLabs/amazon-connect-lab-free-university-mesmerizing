#!/usr/bin/env python3
"""Brand and outbound-link scan.

Fails on LinkedIn, Spotify, and income promises.
A link may be a brand profile, an official vendor or standards host, or a URL
already stored in this lab's source lists. Anything else fails.
"""
import json
import pathlib
import re
import sys
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[1]
BANNED = re.compile(r"linkedin|spotify|get hired|land a job|job guarantee|\bsalary\b|\bearnings\b", re.I)
OFFICIAL_HOSTS = {
    "docs.aws.amazon.com",
    "aws.amazon.com",
    "repost.aws",
    "www.rfc-editor.org",
    "rfc-editor.org",
    "datatracker.ietf.org",
    "creativecommons.org",
    "registry.terraform.io",
}


def load_cited():
    cited = set()
    for path in list(ROOT.rglob("sources.json")) + [ROOT / "data/sources.json"]:
        if not path.is_file():
            continue
        try:
            data = json.loads(path.read_text())
        except json.JSONDecodeError:
            continue
        rows = data.get("sources") if isinstance(data, dict) else data
        for row in rows or []:
            if isinstance(row, dict) and row.get("url"):
                cited.add(row["url"].rstrip("/"))
    return cited


CITED = load_cited()


def allowed(url):
    host = (urlparse(url).hostname or "").lower()
    if host in {"cyphermonkeylabs.com", "www.cyphermonkeylabs.com", "linktr.ee"}:
        return True
    if host in OFFICIAL_HOSTS or host.endswith(".amazonaws.com"):
        return True
    if url.startswith("https://github.com/CypherMonkeyLabs") or url.startswith("https://github.com/amazon-connect/"):
        return True
    if url.rstrip("/") in CITED or url in CITED:
        return True
    return False


def main():
    problems = []
    for path in ROOT.rglob("*"):
        if path.suffix.lower() not in {".html", ".md", ".webmanifest"}:
            continue
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith(("node_modules/", ".git/", "web/vendor/", "campus/vendor/", "tests/")):
            continue
        text = path.read_text(errors="replace")
        for match in BANNED.finditer(text):
            problems.append(f"{rel}: banned wording '{match.group(0)}'")
        for href in re.findall(r'(?:href|src)\s*=\s*["\'](https?://[^"\']+)', text):
            if not allowed(href):
                problems.append(f"{rel}: not a brand link or cited source: {href[:160]}")
    shown = []
    seen = set()
    for item in problems:
        if item in seen:
            continue
        seen.add(item)
        shown.append(item)
    for item in shown[:60]:
        print("FAIL", item)
    print("link_watch problems", len(shown))
    return 1 if shown else 0


if __name__ == "__main__":
    sys.exit(main())
