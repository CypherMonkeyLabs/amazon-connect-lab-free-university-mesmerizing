"""Sources opened in October 2026.

Every URL in a rendered block was requested. A page that 404s, does not
resolve, or lands on a different article is status "confirm". Titles and
final URLs come from that fetch, not from memory.
"""

from __future__ import annotations

import html
import json
import re
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlparse

LAST_CHECKED = "2026-10"
KIND_LABEL = {
    "aws": "AWS docs",
    "rfc": "RFC",
    "community": "community",
    "wikipedia": "Wikipedia",
}

_CHECKS = json.loads((Path(__file__).with_name("source_checks.json")).read_text(encoding="utf-8"))
BY_URL = {item["url"]: item for item in _CHECKS}

TITLE_OVERRIDE = {
    "https://github.com/amazon-connect/amazon-connect-streams": (
        "GitHub - amazon-connect/amazon-connect-streams: Amazon Connect Streams - "
        "a browser-based contact center integration API, typically with CRM systems. · GitHub"
    ),
    "https://github.com/amazon-connect/amazon-connect-salesforce-cti": (
        "GitHub - amazon-connect/amazon-connect-salesforce-cti: "
        "Documentation for Amazon Connect CTI Adapter for Salesforce. · GitHub"
    ),
}

# Opened, but the document that came back is not the article the URL names.
MISLEAD = {
    "https://docs.aws.amazon.com/connect/latest/adminguide/amazon-q-connect.html":
        "Opened 2026-10. The link left this article and opened the Amazon Connect Customer guide home.",
    "https://docs.aws.amazon.com/connect/latest/adminguide/callback.html":
        "Opened 2026-10. The link left this article and opened the Amazon Connect Customer guide home.",
    "https://docs.aws.amazon.com/connect/latest/adminguide/connect-assistant.html":
        "Opened 2026-10. The link left this article and opened the Amazon Connect Customer guide home.",
    "https://docs.aws.amazon.com/connect/latest/adminguide/enable-features.html":
        "Opened 2026-10. The link left this article and opened the Amazon Connect Customer guide home.",
    "https://docs.aws.amazon.com/connect/latest/adminguide/evaluation-forms.html":
        "Opened 2026-10. The link left this article and opened the Amazon Connect Customer guide home.",
    "https://docs.aws.amazon.com/connect/latest/adminguide/metrics.html":
        "Opened 2026-10. The link left this article and opened the Amazon Connect Customer guide home.",
    "https://docs.aws.amazon.com/connect/latest/adminguide/real-time-metrics.html":
        "Opened 2026-10. The link left this article and opened the Amazon Connect Customer guide home.",
    "https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazonconnect.html":
        "Opened 2026-10. The link opened the Service Authorization Reference home, not the Connect action list.",
    "https://en.wikipedia.org/wiki/Amazon_Connect":
        "Opened 2026-10. The page title was Amazon Web Services, not an Amazon Connect article.",
    "https://en.wikipedia.org/wiki/Amazon_CloudWatch":
        "Opened 2026-10. The page title was Amazon Elastic Compute Cloud, not CloudWatch.",
    "https://en.wikipedia.org/wiki/Key_Management_Service":
        "Opened 2026-10. The page title was Volume licensing, not a key-management article.",
    "https://en.wikipedia.org/wiki/Cisco_Unified_Communications_Manager":
        "Opened 2026-10. HTTP 404.",
    "https://ccp.example.com":
        "Opened 2026-10. The host did not resolve. This is a sample name in a study snippet, not a source.",
}

FORCE_VERIFIED = {
    "https://repost.aws/knowledge-center/connect-contact-flow-errors",
}

GUIDE_HOME = "https://docs.aws.amazon.com/connect/latest/adminguide"
AUTH_HOME = "https://docs.aws.amazon.com/service-authorization/latest/reference"

WHAT = "https://docs.aws.amazon.com/connect/latest/adminguide/what-is-amazon-connect.html"
LIMITS = "https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-service-limits.html"
FLOW = "https://docs.aws.amazon.com/connect/latest/adminguide/create-contact-flow.html"
BLOCKS = "https://docs.aws.amazon.com/connect/latest/adminguide/contact-block-definitions.html"
ROUTING = "https://docs.aws.amazon.com/connect/latest/adminguide/concepts-routing.html"
QUEUES = "https://docs.aws.amazon.com/connect/latest/adminguide/concepts-queues-standard-and-agent.html"
TELE = "https://docs.aws.amazon.com/connect/latest/adminguide/concepts-telephony.html"
LAMBDA_BLOCK = "https://docs.aws.amazon.com/connect/latest/adminguide/invoke-lambda-function-block.html"
SECURITY = "https://docs.aws.amazon.com/connect/latest/adminguide/security.html"
SAML = "https://docs.aws.amazon.com/connect/latest/adminguide/configure-saml.html"
RESIL = "https://docs.aws.amazon.com/connect/latest/adminguide/setup-connect-global-resiliency.html"
REPLICA = "https://docs.aws.amazon.com/connect/latest/adminguide/create-replica-connect-instance.html"
LENS = "https://aws.amazon.com/about-aws/whats-new/2020/07/contact-lens-amazon-connect-now-generally-available/"
EVENTS = "https://docs.aws.amazon.com/connect/latest/adminguide/agent-event-streams.html"
CONTACT_EVENTS = "https://docs.aws.amazon.com/connect/latest/adminguide/contact-events.html"
PROFILES = "https://docs.aws.amazon.com/connect/latest/adminguide/customer-profiles.html"
RECORDING = "https://docs.aws.amazon.com/connect/latest/adminguide/set-recording-behavior.html"
WEBRTC_DOC = "https://docs.aws.amazon.com/connect/latest/adminguide/ccp-uses-webrtc.html"
NET = "https://docs.aws.amazon.com/connect/latest/adminguide/ccp-networking.html"
E911 = "https://docs.aws.amazon.com/connect/latest/adminguide/setup-us-emergency-calling.html"
WFM = "https://docs.aws.amazon.com/connect/latest/adminguide/forecasting-capacity-planning-scheduling.html"
LEX = "https://docs.aws.amazon.com/connect/latest/adminguide/amazon-lex.html"
HOURS = "https://docs.aws.amazon.com/connect/latest/adminguide/set-hours-operation.html"
QUICK = "https://docs.aws.amazon.com/connect/latest/adminguide/quick-connects.html"
SF = "https://docs.aws.amazon.com/connect/latest/adminguide/salesforce-integration.html"
VOICEID = "https://docs.aws.amazon.com/connect/latest/adminguide/amazonconnect-voiceid-end-of-support.html"
KMS = "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html"
ENCRYPT = "https://docs.aws.amazon.com/connect/latest/adminguide/encryption-at-rest.html"
STREAMS = "https://github.com/amazon-connect/amazon-connect-streams"
SF_CTI = "https://github.com/amazon-connect/amazon-connect-salesforce-cti"
FLOW_LANG = "https://docs.aws.amazon.com/connect/latest/APIReference/flow-language.html"
REPOST_FLOW = "https://repost.aws/knowledge-center/connect-contact-flow-errors"
REPOST_LAMBDA = "https://repost.aws/knowledge-center/connect-lambda-function-failures"
REPOST_KIN = "https://repost.aws/knowledge-center/connect-integrate-kinesis"
TIMELINE_URL = "https://hidekazu-konishi.com/entry/aws_history_and_timeline_amazon_connect.html"
SN = "https://www.servicenow.com/docs/r/servicenow-platform/integrate-ccc-amazonconnect.html"
TEAMS = "https://aws.amazon.com/blogs/contact-center/streamline-employee-support-with-amazon-connect-and-microsoft-teams-integration/"
CERT = "https://aws.amazon.com/certification/"
LAMBDA_W = "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"
IAM = "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html"
S3 = "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html"
KIN = "https://docs.aws.amazon.com/kinesis/latest/dev/introduction.html"
CW = "https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html"
LEXV2 = "https://docs.aws.amazon.com/lexv2/latest/dg/what-is.html"
PRICE = "https://aws.amazon.com/products/connect/customer/pricing/appendix/"
Q_PAGE = "https://docs.aws.amazon.com/connect/latest/adminguide/amazon-q-connect.html"
METRICS = "https://docs.aws.amazon.com/connect/latest/adminguide/metrics.html"
RT_METRICS = "https://docs.aws.amazon.com/connect/latest/adminguide/real-time-metrics.html"
RFC_SIP = "https://www.rfc-editor.org/rfc/rfc3261"
RFC_RTP = "https://www.rfc-editor.org/rfc/rfc3550"
RFC_SRTP = "https://www.rfc-editor.org/rfc/rfc3711"
RFC_TURN = "https://www.rfc-editor.org/rfc/rfc5766"
RFC_WS = "https://www.rfc-editor.org/rfc/rfc6455"
RFC_TLS = "https://www.rfc-editor.org/rfc/rfc8446"
RFC_WEBRTC = "https://www.rfc-editor.org/rfc/rfc8825"
WIKI_AWS = "https://en.wikipedia.org/wiki/Amazon_Web_Services"
WIKI_CALL = "https://en.wikipedia.org/wiki/Call_centre"
WIKI_IVR = "https://en.wikipedia.org/wiki/Interactive_voice_response"
WIKI_ACD = "https://en.wikipedia.org/wiki/Automatic_call_distributor"
WIKI_SIP = "https://en.wikipedia.org/wiki/Session_Initiation_Protocol"
WIKI_RTP = "https://en.wikipedia.org/wiki/Real-time_Transport_Protocol"
WIKI_TLS = "https://en.wikipedia.org/wiki/Transport_Layer_Security"
WIKI_WEBRTC = "https://en.wikipedia.org/wiki/WebRTC"
WIKI_LAMBDA = "https://en.wikipedia.org/wiki/AWS_Lambda"
WIKI_S3 = "https://en.wikipedia.org/wiki/Amazon_S3"
WIKI_KIN = "https://en.wikipedia.org/wiki/Amazon_Kinesis"
WIKI_LEX = "https://en.wikipedia.org/wiki/Amazon_Lex"
WIKI_IAM = "https://en.wikipedia.org/wiki/Identity_and_access_management"
WIKI_SAML = "https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language"
WIKI_SF = "https://en.wikipedia.org/wiki/Salesforce"
WIKI_SN = "https://en.wikipedia.org/wiki/ServiceNow"
WIKI_CRM = "https://en.wikipedia.org/wiki/Customer_relationship_management"
WIKI_WFM = "https://en.wikipedia.org/wiki/Workforce_management"
WIKI_E911 = "https://en.wikipedia.org/wiki/Enhanced_9-1-1"
WIKI_CUCM = "https://en.wikipedia.org/wiki/Cisco_Unified_Communications_Manager"

TRACK_DEEPER = {
    "foundations": [WHAT, RFC_TLS, TIMELINE_URL, WIKI_AWS],
    "instance": [SAML, WHAT, RFC_TLS, TIMELINE_URL, WIKI_AWS],
    "telephony": [TELE, RFC_SIP, RFC_RTP, LIMITS, WIKI_SIP, WIKI_CALL],
    "flows": [FLOW, BLOCKS, FLOW_LANG, REPOST_FLOW, WIKI_IVR],
    "lex": [LEX, LEXV2, FLOW, WIKI_LEX, WIKI_IVR],
    "ai": [VOICEID, LENS, TIMELINE_URL, Q_PAGE, WIKI_CALL],
    "lambda": [LAMBDA_BLOCK, LAMBDA_W, REPOST_LAMBDA, WIKI_LAMBDA],
    "routing": [ROUTING, QUEUES, HOURS, QUICK, WIKI_ACD],
    "workspace": [WEBRTC_DOC, NET, STREAMS, RFC_WEBRTC, RFC_TURN, RFC_WS, WIKI_WEBRTC],
    "records": [PROFILES, WHAT, WIKI_CRM],
    "channels": [LIMITS, FLOW, WIKI_CALL],
    "analytics": [EVENTS, CONTACT_EVENTS, LENS, REPOST_KIN, KIN, WIKI_KIN],
    "security": [SECURITY, ENCRYPT, KMS, SAML, RFC_TLS, WIKI_IAM, WIKI_SAML, WIKI_TLS],
    "resiliency": [RESIL, REPLICA, TIMELINE_URL, WIKI_AWS],
    "troubleshoot": [REPOST_FLOW, REPOST_LAMBDA, WEBRTC_DOC, RFC_TURN, WIKI_WEBRTC],
    "bridge": [ROUTING, TELE, RFC_SIP, WIKI_CALL, WIKI_SIP],
    "integrations": [SF, SN, TEAMS, STREAMS, WIKI_SF, WIKI_SN, WIKI_CRM],
    "ecosystem": [WFM, E911, RECORDING, PROFILES, WIKI_WFM, WIKI_E911, WIKI_CRM],
}

LESSON_EXTRA = {
    "foundations-lambda": [LAMBDA_W, LAMBDA_BLOCK, REPOST_LAMBDA, WIKI_LAMBDA],
    "foundations-s3": [S3, RECORDING, WIKI_S3],
    "foundations-kinesis": [KIN, EVENTS, REPOST_KIN, WIKI_KIN],
    "foundations-cloudwatch": [CW, REPOST_FLOW, WIKI_AWS],
    "foundations-iam": [IAM, SECURITY, WIKI_IAM],
    "foundations-network": [NET, WEBRTC_DOC, RFC_TURN, RFC_TLS, RFC_WEBRTC, WIKI_WEBRTC, WIKI_TLS],
    "foundations-certs": [CERT, TIMELINE_URL, WIKI_AWS],
    "foundations-timeline": [TIMELINE_URL, LENS, VOICEID, WIKI_AWS],
    "an-metrics": [RT_METRICS, EVENTS, CONTACT_EVENTS, WIKI_CALL],
    "br-reports": [METRICS, EVENTS, WIKI_CALL],
    "br-map": [ROUTING, RFC_SIP, WIKI_CALL, WIKI_CUCM],
    "int-cucm": [TELE, RFC_SIP, WIKI_SIP, WIKI_CUCM],
    "int-sf": [SF, SF_CTI, WIKI_SF],
    "int-sn": [SN, WIKI_SN],
    "int-teams": [TEAMS, WIKI_CALL],
    "eco-e911": [E911, WIKI_E911],
    "eco-wfm": [WFM, WIKI_WFM],
    "eco-wfm-3p": [WFM, EVENTS, WIKI_WFM],
    "ai-names": [Q_PAGE, VOICEID, TIMELINE_URL, WIKI_CALL],
    "ai-config": [Q_PAGE, LENS, WIKI_CALL],
    "ai-agentic": [Q_PAGE, TIMELINE_URL, WIKI_CALL],
    "sec-kms": [KMS, ENCRYPT, RFC_TLS, WIKI_TLS],
    "sec-price": [PRICE, LIMITS, WIKI_AWS],
    "ws-streams": [STREAMS, RFC_WS, WEBRTC_DOC, WIKI_WEBRTC],
    "flows-language": [FLOW_LANG, BLOCKS, WIKI_IVR],
    "tel-external": [RFC_SIP, RFC_RTP, RFC_SRTP, TELE, WIKI_SIP, WIKI_RTP],
}

from new_chapters import EXTRA_SOURCES  # noqa: E402

LESSON_EXTRA.update(EXTRA_SOURCES)


def kind_of(url: str) -> str:
    host = urlparse(url).netloc.lower()
    if host.endswith("rfc-editor.org"):
        return "rfc"
    if "wikipedia.org" in host:
        return "wikipedia"
    if host.endswith("docs.aws.amazon.com") or host.endswith("aws.amazon.com"):
        return "aws"
    return "community"


def _clean_title(text: str) -> str:
    text = html.unescape(text or "")
    return re.sub(r"\s+", " ", text).strip()


def _slug_title(url: str) -> str:
    slug = url.rstrip("/").rsplit("/", 1)[-1]
    slug = re.sub(r"\.html$", "", slug).replace("-", " ").replace("_", " ")
    return slug or url


CONFIRM_TITLES = {
    "https://docs.aws.amazon.com/connect/latest/adminguide/amazon-q-connect.html": "Amazon Q in Connect",
    "https://docs.aws.amazon.com/connect/latest/adminguide/callback.html": "Queue callback",
    "https://docs.aws.amazon.com/connect/latest/adminguide/connect-assistant.html": "Connect assistant",
    "https://docs.aws.amazon.com/connect/latest/adminguide/enable-features.html": "Enable features",
    "https://docs.aws.amazon.com/connect/latest/adminguide/evaluation-forms.html": "Evaluation forms",
    "https://docs.aws.amazon.com/connect/latest/adminguide/metrics.html": "Metrics",
    "https://docs.aws.amazon.com/connect/latest/adminguide/real-time-metrics.html": "Real-time metrics",
    "https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazonconnect.html": "Amazon Connect service authorization",
    "https://en.wikipedia.org/wiki/Amazon_Connect": "Amazon Connect",
    "https://en.wikipedia.org/wiki/Amazon_CloudWatch": "Amazon CloudWatch",
    "https://en.wikipedia.org/wiki/Key_Management_Service": "Key Management Service",
    "https://en.wikipedia.org/wiki/Cisco_Unified_Communications_Manager": "Cisco Unified Communications Manager",
    "https://ccp.example.com": "ccp.example.com",
}


def _confirm(url: str, claimed_title: str | None, note: str) -> dict:
    """Unopenable rows stay confirm and carry no URL."""
    return {
        "title": claimed_title or _slug_title(url),
        "kind": kind_of(url),
        "last_checked": LAST_CHECKED,
        "status": "confirm",
        "note": note,
    }


def classify(url: str, claimed_title: str | None = None) -> dict:
    """Return one source row. Unopened and misleading URLs are confirm."""
    item = BY_URL.get(url)
    if item is None:
        return _confirm(url, claimed_title, "Not opened in the 2026-10 check.")
    if url in MISLEAD:
        return _confirm(url, claimed_title or CONFIRM_TITLES.get(url), MISLEAD[url])
    final = (item.get("final") or url).split("#")[0]
    if final.rstrip("/") in {GUIDE_HOME, AUTH_HOME} and url.rstrip("/") not in {GUIDE_HOME, AUTH_HOME}:
        return _confirm(
            url,
            claimed_title,
            "Opened 2026-10. The link left this article and opened a guide home page.",
        )
    raw = _clean_title(TITLE_OVERRIDE.get(url) or item.get("title") or "")
    verified = url in FORCE_VERIFIED or (item.get("ok") and bool(raw))
    if not verified:
        status = item.get("status")
        if status == 404:
            note = "Opened 2026-10. HTTP 404."
        elif status == 0:
            note = "Opened 2026-10. The host did not resolve."
        else:
            note = "Opened 2026-10. " + (item.get("note") or "The page could not be confirmed.")
        return _confirm(url, claimed_title, note)
    title = raw
    if title == "Terraform Registry":
        title = "Terraform Registry: " + final.rstrip("/").rsplit("/", 1)[-1]
    row = {
        "title": title,
        "url": final,
        "kind": kind_of(final),
        "last_checked": LAST_CHECKED,
        "status": "verified",
    }
    if final.rstrip("/") != url.rstrip("/"):
        row["opened"] = url
    return row


def from_urls(urls, claimed=None) -> list:
    claimed = claimed or {}
    seen = set()
    rows = []
    for url in urls:
        if not url:
            continue
        row = classify(url, claimed.get(url))
        key = row.get("url") or ("confirm:" + row["title"])
        if key in seen:
            continue
        seen.add(key)
        rows.append(row)
    return rows


def merge_sources(groups) -> list:
    seen = set()
    rows = []
    for group in groups:
        for row in group:
            key = row.get("url") or ("confirm:" + row["title"])
            if key in seen:
                continue
            seen.add(key)
            rows.append(row)
    return rows


def track_urls(track_id: str) -> list:
    return list(TRACK_DEEPER.get(track_id) or TRACK_DEEPER["foundations"])


def room_sources(lesson: dict) -> list:
    extra = LESSON_EXTRA.get(lesson["id"], track_urls(lesson["track"]))
    urls = [lesson["cite"]["url"], *extra]
    return from_urls(urls, {lesson["cite"]["url"]: lesson["cite"]["title"]})


def chapter_sources(lessons) -> list:
    return merge_sources(room_sources(lesson) for lesson in lessons)


def track_sources(track_id: str) -> list:
    return from_urls(track_urls(track_id))


def lab_sources() -> list:
    return from_urls([WHAT, RFC_SIP, REPOST_FLOW, TIMELINE_URL, WIKI_CALL])


def card_sources(url: str, title: str, track: str) -> list:
    urls = [url, *track_urls(track)]
    return from_urls(urls, {url: title} if url else None)


def sources_lines(items) -> list:
    lines = ["Sources and go deeper"]
    for item in items:
        label = KIND_LABEL[item["kind"]]
        checked = "last checked " + item["last_checked"]
        if item["status"] == "verified" and item.get("url"):
            lines.append(f"{item['title']} ({label}) {item['url']} {checked}")
        else:
            lines.append(f"confirm. {item['title']} ({label}) {checked}. {item.get('note', '')}")
    return lines


def _unique_titles() -> dict:
    found = defaultdict(set)
    from curriculum import LESSONS
    from glossary import GLOSSARY
    from tables import TIMELINE
    from visuals import FAULTS

    for _term, _meaning, _track, url, source in GLOSSARY:
        found[source].add(url)
    for lesson in LESSONS:
        found[lesson["cite"]["title"]].add(lesson["cite"]["url"])
    for _date, _kind, _name, _summary, url, source in TIMELINE:
        found[source].add(url)
    for row in FAULTS:
        found[row[5]].add(row[4])
    return {title: next(iter(urls)) for title, urls in found.items() if len(urls) == 1}


_TITLE_URL = None


def url_for_title(title: str):
    global _TITLE_URL
    if _TITLE_URL is None:
        _TITLE_URL = _unique_titles()
    return _TITLE_URL.get(title)


def sources_for_named_card(front: str, source_title: str, track: str, facts_by_term=None) -> list:
    """Campus cards often store a source title. Use the fact URL when the term is known."""
    fact = (facts_by_term or {}).get(front)
    if fact is None:
        fact = (facts_by_term or {}).get(re.sub(r" \(\d+\)$", "", front))
    if fact and fact.get("url"):
        return card_sources(fact["url"], fact.get("source") or source_title, track)
    unique = url_for_title(source_title)
    if unique:
        return card_sources(unique, source_title, track)
    rows = from_urls(track_urls(track))
    rows.append({
        "title": source_title or front,
        "kind": "community",
        "last_checked": LAST_CHECKED,
        "status": "confirm",
        "note": "Opened pages use this label for more than one URL, so it is not pinned to a single link.",
    })
    return rows
