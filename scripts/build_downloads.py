#!/usr/bin/env python3
"""Write the Cheat Codes hub: HTML, PDF, and PNG sheets plus the offline zip."""
import json
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CAMPUS = ROOT / "campus"
OUT = CAMPUS / "downloads"

REPO = "https://github.com/cipher0x9/amazon-connect-lab-free-university-mesmerizing"
HOME = "https://cyphermonkeylabs.com"
CONTACT = HOME + "/#contact"
LINKS = [
    (HOME, "CypherMonkey Labs"),
    ("https://linktr.ee/cyphermonkey", "Linktree"),
    (REPO, "This lab on GitHub"),
    ("https://dev.to/cyphermonkey", "dev.to"),
    ("https://huggingface.co/Cypher0x9", "Hugging Face"),
    ("https://x.com/Cypher0x9", "X"),
]

DISCLAIMER = (
    "Independent educational project, not affiliated with or endorsed by any vendor. "
    "Trademarks belong to their owners. MIT code, CC BY-NC-SA content. "
    "Study notes, not a copy of a vendor document."
)


def font(size, bold=False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    path = Path("/usr/share/fonts/truetype/dejavu") / name
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def footer_html():
    anchors = " · ".join(f'<a href="{href}">{label}</a>' for href, label in LINKS)
    return f"""<footer class="sheet-foot">
  <p>CypherMonkey · Amazon Connect Lab</p>
  <p>{anchors}</p>
  <p>{DISCLAIMER}</p>
  <p><a href="{CONTACT}">Work with us</a> · <a href="{CONTACT}">Report a concern / takedown</a></p>
</footer>"""


def page(title, body):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Amazon Connect Lab</title>
<style>
  body {{ margin: 0; font: 16px/1.45 "Segoe UI", sans-serif; color: #14202b; background: #f4f7fb; }}
  main {{ max-width: 880px; margin: 0 auto; padding: 28px 18px 48px; }}
  h1 {{ font-size: 32px; line-height: 1.1; margin: 0 0 8px; }}
  h2 {{ font-size: 20px; margin: 22px 0 8px; }}
  p {{ margin: 8px 0; }}
  table {{ width: 100%; border-collapse: collapse; background: #fff; }}
  th, td {{ border-bottom: 1px solid #d5deea; text-align: left; vertical-align: top; padding: 8px; font-size: 14px; }}
  .flag {{ background: #fff4d6; }}
  a {{ color: #0f5c6b; }}
  .card {{ break-inside: avoid; border: 1px solid #d5deea; background: #fff; border-radius: 12px; padding: 12px; margin: 8px 0; }}
  .sheet-foot {{ margin-top: 28px; padding-top: 12px; border-top: 2px solid #e5843b; font-size: 13px; color: #3d4d5c; }}
  @media print {{ body {{ background: #fff; }} a {{ color: inherit; text-decoration: none; }} }}
</style>
</head>
<body>
<main>
<h1>{title}</h1>
{body}
{footer_html()}
</main>
</body>
</html>
"""


def esc(text):
    return (str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def rows(items, headers, cells):
    head = "".join(f"<th>{esc(h)}</th>" for h in headers)
    body = []
    for item in items:
        cls = ' class="flag"' if item.get("unverified") else ""
        body.append("<tr" + cls + ">" + "".join(f"<td>{cells(item, key)}</td>" for key in headers) + "</tr>")
    return f"<table><thead><tr>{head}</tr></thead><tbody>{''.join(body)}</tbody></table>"


def cite(url, source):
    return f'<p>Source: <a href="{esc(url)}">{esc(source)}</a></p>'


def wrap_lines(text, width=92):
    words = text.split()
    lines, cur = [], ""
    for word in words:
        trial = word if not cur else cur + " " + word
        if len(trial) > width:
            if cur:
                lines.append(cur)
            cur = word
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return lines or [""]


def pdf_escape(text):
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def build_pdf(title, paragraphs):
    """A small text PDF. Helvetica, no embedded images, several pages if needed."""
    lines = [title, ""]
    for para in paragraphs:
        lines.extend(wrap_lines(para))
        lines.append("")
    lines.extend([
        "CypherMonkey · Amazon Connect Lab",
        "cyphermonkeylabs.com · linktr.ee/cyphermonkey · github.com/cipher0x9/amazon-connect-lab-free-university-mesmerizing",
        DISCLAIMER,
        "Work with us and report a concern: cyphermonkeylabs.com/#contact",
    ])
    per = 46
    pages = [lines[i:i + per] for i in range(0, len(lines), per)] or [[" "]]
    objects = []

    def add(body):
        objects.append(body)
        return len(objects)

    font_id = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    content_ids = []
    for page_lines in pages:
        commands = ["BT", "/F1 11 Tf", "14 TL", "48 780 Td"]
        first = True
        for line in page_lines:
            if first:
                commands.append(f"({pdf_escape(line)}) Tj")
                first = False
            else:
                commands.append(f"T* ({pdf_escape(line)}) Tj")
        commands.append("ET")
        stream = "\n".join(commands).encode("latin-1", "replace")
        content_ids.append(add(f"<< /Length {len(stream)} >>\nstream\n".encode("ascii") + stream + b"\nendstream"))
    page_ids = []
    for cid in content_ids:
        page_ids.append(add(
            f"<< /Type /Page /Parent PAGES 0 R /MediaBox [0 0 612 792] "
            f"/Resources << /Font << /F1 {font_id} 0 R >> >> /Contents {cid} 0 R >>"
        ))
    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    pages_id = add(f"<< /Type /Pages /Count {len(page_ids)} /Kids [{kids}] >>")
    catalog_id = add(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")
    for index, body in enumerate(objects, start=1):
        if isinstance(body, str) and "Parent PAGES" in body:
            objects[index - 1] = body.replace("Parent PAGES", f"Parent {pages_id}")
    out = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, body in enumerate(objects, start=1):
        offsets.append(len(out))
        if isinstance(body, str):
            blob = f"{index} 0 obj\n{body}\nendobj\n".encode("latin-1", "replace")
        else:
            blob = f"{index} 0 obj\n".encode("ascii") + body + b"\nendobj\n"
        out.extend(blob)
    xref = len(out)
    out.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    out.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        out.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    out.extend(f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode("ascii"))
    return bytes(out)


def poster(title, lines, path):
    image = Image.new("RGB", (1100, 1500), "#07141c")
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 1100, 18), fill="#e5843b")
    draw.text((48, 48), "AMAZON CONNECT LAB", font=font(22, True), fill="#f0c56a")
    draw.text((48, 96), title[:42], font=font(42, True), fill="#f3efe4")
    y = 180
    body = font(22)
    for line in lines:
        for part in wrap_lines(line, 62):
            if y > 1320:
                break
            fill = "#f0c56a" if part.startswith("UNVERIFIED") or part.startswith("Source") else "#e7eef6"
            draw.text((48, y), part, font=body, fill=fill)
            y += 32
        y += 10
    draw.rectangle((0, 1380, 1100, 1500), fill="#10202b")
    small = font(18)
    draw.text((48, 1400), "CypherMonkey · cyphermonkeylabs.com · linktr.ee/cyphermonkey", font=small, fill="#f3efe4")
    draw.text((48, 1432), "MIT code · CC BY-NC-SA content · Not affiliated with any vendor", font=small, fill="#c9d6df")
    draw.text((48, 1464), "Work with us / report a concern: cyphermonkeylabs.com/#contact", font=small, fill="#3dcfb4")
    image.save(path, "PNG")


def write_sheet(slug, title, intro, html_body, pdf_lines):
    (OUT / f"{slug}.html").write_text(page(title, f"<p>{esc(intro)}</p>{html_body}"))
    (OUT / f"{slug}.pdf").write_bytes(build_pdf(title, [intro] + pdf_lines))
    poster(title, [intro] + pdf_lines[:28], OUT / f"{slug}.png")
    return slug


def link_card(slug, title, intro):
    return f"""<article class="card"><h2>{esc(title)}</h2><p>{esc(intro)}</p>
    <p><a href="{slug}.html">HTML</a> · <a href="{slug}.pdf">PDF</a> · <a href="{slug}.png">PNG</a></p></article>"""


def offline_zip():
    target = OUT / "amazon-connect-lab.zip"
    if target.exists():
        target.unlink()
    release = ROOT / "releases" / "amazon-connect-lab.zip"
    release.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as handle:
        for path in CAMPUS.rglob("*"):
            if not path.is_file():
                continue
            if path == target:
                continue
            handle.write(path, path.relative_to(CAMPUS).as_posix())
    release.write_bytes(target.read_bytes())


def main():
    import sys
    sys.path.insert(0, str(ROOT / "content"))
    from mastery import (  # noqa: E402
        CALL_FLOW, CAREERS, CONFIG, CUTOVER, EXPLORER, FIREWALL, INTERVIEW, PORTS_QUIZ,
        SYLLABUS, TROUBLE_TREE, WHATS_NEW,
    )

    OUT.mkdir(parents=True, exist_ok=True)
    glossary = json.loads((CAMPUS / "data" / "glossary.json").read_text())["terms"]
    cards = json.loads((CAMPUS / "data" / "cards.json").read_text())["cards"]

    sheets = []

    def add(slug, title, intro, html_body, pdf_lines):
        write_sheet(slug, title, intro, html_body, pdf_lines)
        sheets.append((slug, title, intro))

    add("ports-protocols", "Ports and protocols",
        "Agent workstation path for the Contact Control Panel. Confirm the current admin guide before you change a firewall.",
        rows(FIREWALL, ["hop", "proto", "port", "direction", "dest", "note"], lambda item, key: esc(item[key]))
        + cite(FIREWALL[0]["url"], FIREWALL[0]["source"]),
        [f"{row['hop']}: {row['proto']} {row['port']} {row['direction']} to {row['dest']}. {row['note']}" for row in FIREWALL])

    add("call-flows", "Call flow ladder",
        "One inbound voice contact, from the PSTN to after-contact work.",
        "<ol>" + "".join(f"<li><strong>{esc(a)}</strong> {esc(b)}</li>" for a, b in CALL_FLOW) + "</ol>"
        + cite("https://docs.aws.amazon.com/connect/latest/adminguide/create-contact-flow.html", "Flow types"),
        [f"{i + 1}. {a} — {b}" for i, (a, b) in enumerate(CALL_FLOW)])

    add("config-checklist", "Configuration checklist",
        "Twelve checks before a pilot number takes real traffic.",
        "<ol>" + "".join(f"<li><strong>{esc(a)}</strong> {esc(b)}</li>" for a, b in CONFIG) + "</ol>",
        [f"{a}: {b}" for a, b in CONFIG])

    add("troubleshoot-tree", "Troubleshooting tree",
        "Pick the symptom, then the capture. Change one thing.",
        "<ol>" + "".join(f"<li><strong>{esc(a)}</strong> {esc(b)} Lab: {esc(c)}.</li>" for a, b, c in TROUBLE_TREE) + "</ol>"
        + cite("https://repost.aws/knowledge-center/connect-contact-flow-errors", "re:Post, flow errors"),
        [f"{a} — {b} (lab {c})" for a, b, c in TROUBLE_TREE])

    add("firewall-matrix", "Firewall matrix",
        "Same ports as the ports sheet, laid out as a change ticket. The video row is unverified on purpose.",
        rows(FIREWALL, ["hop", "proto", "port", "direction", "dest", "note"], lambda item, key: esc(item[key])),
        [f"{row['hop']} | {row['proto']} | {row['port']} | {row['note']}" for row in FIREWALL])

    add("cutover", "Cutover plan",
        "Dual-run, evidence, then the rest. Heroic cutovers are how recordings go missing.",
        "".join(f"<article class='card'><h2>{esc(step['step'] + '. ' + step['title'])}</h2><p>{esc(step['body'])}</p></article>" for step in CUTOVER)
        + cite("https://docs.aws.amazon.com/connect/latest/adminguide/concepts-routing.html", "Routing profiles, used as the object map"),
        [f"{step['step']}. {step['title']}: {step['body']}" for step in CUTOVER])

    add("career", "Career paths and interview prompts",
        "Badges are not certifications. Say the exam name or the badge name, not both for one credential.",
        "".join(
            f"<article class='card'><h2>{esc(row['role'])}</h2><p>{esc(row['proof'])}</p><p>{esc(row['credential'])}</p>{cite(row['url'], row['source'])}</article>"
            for row in CAREERS
        ) + "<h2>Interview prompts</h2>" + "".join(f"<article class='card'><h2>{esc(row['q'])}</h2><p>{esc(row['a'])}</p></article>" for row in INTERVIEW),
        [f"{row['role']}: {row['credential']}" for row in CAREERS] + [f"Q: {row['q']} A: {row['a']}" for row in INTERVIEW])

    add("whats-new-2026", "What's new, 2026",
        "Cited through the 14 October 2026 read. The last row is unverified by design.",
        rows(WHATS_NEW, ["date", "name", "summary"], lambda item, key: esc(item[key]))
        + cite(WHATS_NEW[0]["url"], WHATS_NEW[0]["source"]),
        [f"{row['date']} {row['name']}: {row['summary']} ({row['source']})" for row in WHATS_NEW])

    add("e911", "E911 for CCP agents",
        "United States agents on the CCP. Test with 933. Do not place a live 911 call from this lab.",
        "<ol><li>Validate the address with the Chime ValidateE911Address API.</li><li>Store it on that agent's Customer Profile.</li><li>An outbound whisper flow copies it to CivicAddress when the dialed string is 911 or 933.</li><li>Direct 911 from the CCP is documented for US East (N. Virginia), US West (Oregon), and GovCloud US-West.</li><li>Connect does not transfer a live call to 911 and does not let an agent dial 911 while already on a call.</li></ol>"
        + cite("https://docs.aws.amazon.com/connect/latest/adminguide/setup-us-emergency-calling.html", "US emergency calling"),
        ["Validate with Chime ValidateE911Address.", "Store on the agent profile.", "Whisper copies CivicAddress for 911 or 933.", "Test with 933 only.", "Source: US emergency calling in the admin guide."])

    add("wfm", "Workforce management",
        "Native forecasting and agent scheduling, and the third-party feed.",
        "<ul><li>The 4 August 2026 name is forecasting and agent scheduling.</li><li>Agent events are the adherence feed. Historical reports are not.</li><li>A blank board on day one usually means no event, an unmapped status, or a schedule that was never published.</li><li>One Kinesis shard and two consumers is a Monday-morning lag.</li><li>Shrinkage is the fraction of paid time that is not handling contacts.</li></ul>"
        + cite("https://docs.aws.amazon.com/connect/latest/adminguide/forecasting-capacity-planning-scheduling.html", "Forecasting and scheduling"),
        ["Native name since 4 Aug 2026: forecasting and agent scheduling.", "Agent events feed adherence.", "Publish the schedule or the board stays blank.", "Size shards for every consumer.", "Source: Forecasting and scheduling."])

    gloss_html = "".join(
        f"<article class='card'><h2>{esc(term['term'])}</h2><p>{esc(term['meaning'])}</p>{cite(term['url'], term['source'])}</article>"
        for term in glossary
    )
    add("glossary", "Glossary",
        f"{len(glossary)} terms. Each one points at the page the fact came from.",
        gloss_html,
        [f"{term['term']}: {term['meaning']}" for term in glossary[:40]] + [f"{len(glossary)} terms are in the HTML sheet. This PDF keeps the first 40."])

    deck = []
    for card in cards:
        deck.append({"front": card["front"], "back": card["back"], "track": card["track"], "source": card["source"]})
    (OUT / "flashcards.json").write_text(json.dumps({"deck": "Amazon Connect Lab", "cards": deck}, ensure_ascii=False))
    printable = "".join(
        f"<article class='card'><h2>{esc(card['front'])}</h2><p>{esc(card['back'])}</p><p>{esc(card['source'])}</p></article>"
        for card in deck[:80]
    )
    add("flashcards", "Printable flashcards",
        f"The first 80 of {len(deck)} cards are on this sheet. flashcards.json is the full deck. Print this HTML to PDF from the browser if you want a paper set.",
        printable + '<p><a href="flashcards.json">Download flashcards.json</a></p>',
        [f"{card['front']} — {card['back']}" for card in deck[:40]])

    add("syllabus", "Syllabus",
        "Every Round 2 section, and where it lives in the campus.",
        "".join(
            f"<article class='card'><h2>{esc(row['level'] + ' · ' + row['title'])}</h2><p>{esc(row['blurb'])}</p></article>"
            for row in SYLLABUS
        ),
        [f"{row['level']}: {row['title']} — {row['blurb']}" for row in SYLLABUS])

    mastery = {
        "syllabus": SYLLABUS,
        "firewall": FIREWALL,
        "cutover": CUTOVER,
        "careers": CAREERS,
        "whatsNew": WHATS_NEW,
        "portsQuiz": PORTS_QUIZ,
        "explorer": EXPLORER,
        "interview": INTERVIEW,
        "sheets": [{"slug": slug, "title": title, "intro": intro} for slug, title, intro in sheets],
    }
    (CAMPUS / "data" / "mastery.json").write_text(json.dumps(mastery, ensure_ascii=False, separators=(",", ":")))

    cards_html = "".join(link_card(slug, title, intro) for slug, title, intro in sheets)
    cards_html += '<article class="card"><h2>Full offline bundle</h2><p>The campus folder, including these sheets, as a zip. Unzip it and serve the folder over HTTP.</p><p><a href="amazon-connect-lab.zip" download>amazon-connect-lab.zip</a></p></article>'
    (OUT / "index.html").write_text(page("Cheat codes", "<p>One sheet per topic. HTML to read, PDF to file, PNG to pin. Nothing here is fetched from a vendor site.</p>" + cards_html))

    offline_zip()
    print(json.dumps({"sheets": len(sheets), "cards": len(deck), "zip": (OUT / "amazon-connect-lab.zip").stat().st_size}))


if __name__ == "__main__":
    main()
