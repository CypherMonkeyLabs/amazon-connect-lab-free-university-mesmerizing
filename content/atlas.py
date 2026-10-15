"""Hand-drawn Diagram Atlas for the campus home, menu, and track pages.

Numbers are the same quotas, prices, and timings the lessons cite.
Video and Chime media ports are omitted on purpose: they are unverified here.
"""

DOC = "https://docs.aws.amazon.com/connect/latest/adminguide/"
PRICE = "https://aws.amazon.com/products/connect/customer/pricing/appendix/"
QUOTA = DOC + "amazon-connect-service-limits.html"
NET = DOC + "ccp-networking.html"
FLOW = DOC + "create-contact-flow.html"
LAMBDA = DOC + "invoke-lambda-function-block.html"
GR = DOC + "setup-connect-global-resiliency.html"
E911 = DOC + "setup-us-emergency-calling.html"
BADGE = "https://aws.amazon.com/blogs/contact-center/elevate-your-amazon-connect-skills-with-specialty-training-badges/"


def _esc(text):
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _frame(body, label, w=760, h=220):
    return (
        f'<svg viewBox="0 0 {w} {h}" role="img" aria-label="{_esc(label)}">'
        f'<rect width="{w}" height="{h}" rx="16" fill="#0e1728"/>{body}</svg>'
    )


def _box(x, y, w, h, label, stroke="#3dcfb4"):
    return (
        f'<g><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#131d31" stroke="{stroke}" stroke-width="2"/>'
        f'<text x="{x + w / 2:.0f}" y="{y + h / 2 + 5:.0f}" text-anchor="middle" fill="#f3efe4" font-size="13" '
        f'font-family="ui-sans-serif,system-ui,sans-serif">{_esc(label)}</text></g>'
    )


def _token(path, dur="5s", color="#ffb020"):
    return f'<circle r="6" fill="{color}"><animateMotion dur="{dur}" repeatCount="indefinite" path="{path}"/></circle>'


def _hops(labels, y=86, gap=148, w=120, h=48, x0=20):
    parts = []
    centers = []
    for i, label in enumerate(labels):
        x = x0 + i * gap
        parts.append(_box(x, y, w, h, label))
        centers.append((x + w / 2, y + h / 2))
    x1, y1 = centers[0]
    x2, _ = centers[-1]
    parts.insert(0, f'<line x1="{x1:.0f}" y1="{y1:.0f}" x2="{x2:.0f}" y2="{y1:.0f}" stroke="#ffb020" stroke-width="3" opacity="0.85"/>')
    parts.append(_token(f"M{x1:.0f},{y1:.0f} H{x2:.0f}"))
    return "".join(parts), centers


def _item(item_id, title, kind, svg, caption, source, url, animated=False):
    return {
        "id": item_id,
        "title": title,
        "kind": kind,
        "animated": animated,
        "caption": caption,
        "source": source,
        "url": url,
        "svg": svg,
    }


def _flow(item_id, title, labels, caption, source, url, y=78):
    body, _ = _hops(labels, y=y)
    svg = _frame(body, title)
    return _item(item_id, title, "flow", svg, caption, source, url, True)


def _bars(title, rows, unit, ymax=None):
    width, height = 760, 280
    left, top, chart_w, chart_h = 168, 28, 540, 200
    peak = ymax or max(value for _, value, _ in rows) or 1
    if peak <= 0:
        peak = 1
    band = chart_h / max(1, len(rows))
    parts = [
        f'<text x="24" y="22" fill="#f3efe4" font-size="14" font-family="ui-sans-serif,system-ui,sans-serif">{_esc(title)}</text>'
    ]
    for index, (label, value, shown) in enumerate(rows):
        y = top + index * band + 8
        bh = max(10, band - 16)
        bw = 8 if value <= 0 else max(8, (value / peak) * chart_w)
        color = "#f472b6" if value <= 0 else ("#ffb020" if index % 2 == 0 else "#2dd4bf")
        parts.append(f'<text x="16" y="{y + bh / 2 + 4:.0f}" fill="#f3efe4" font-size="13" font-family="ui-sans-serif,system-ui,sans-serif">{_esc(label)}</text>')
        parts.append(f'<rect x="{left}" y="{y:.0f}" width="{bw:.0f}" height="{bh:.0f}" rx="6" fill="{color}"/>')
        parts.append(f'<text x="{left + bw + 8:.0f}" y="{y + bh / 2 + 4:.0f}" fill="#f3efe4" font-size="13" font-family="ui-sans-serif,system-ui,sans-serif">{_esc(shown)} {_esc(unit)}</text>')
    return _frame("".join(parts), title, width, height)


def build_atlas():
    diagrams = []
    diagrams.append(_flow(
        "inbound-ladder", "Inbound voice ladder",
        ["PSTN", "Flow", "Queue", "Agent", "ACW"],
        "One inbound voice contact. The number hits a flow, the flow offers a queue, the agent works it, then after-contact work.",
        "Create a flow", FLOW,
    ))
    diagrams.append(_flow(
        "signal-media", "Signaling beside media",
        ["Browser", "TCP 443", "Instance", "UDP 3478", "TurnNlb"],
        "Sign-in can succeed on TCP 443 while the softphone stays silent because UDP 3478 to TurnNlb is blocked.",
        "Set up your network", NET,
    ))
    diagrams.append(_flow(
        "lambda-8s", "Synchronous Lambda, 8 seconds",
        ["Flow", "Invoke", "8s cap", "Return", "Error branch"],
        "A synchronous Lambda invoke from a flow has an 8 second ceiling. TimeLimitExceeded must have a branch.",
        "Invoke Lambda function block", LAMBDA,
    ))
    diagrams.append(_flow(
        "lex-fallback", "Lex fallback to a person",
        ["Caller", "Lex V2", "No intent", "Error", "Queue"],
        "When no intent comes back, the error branch has to reach a person. A silent end is a dropped caller.",
        "Create a flow", FLOW,
    ))
    diagrams.append(_flow(
        "queue-priority", "Queue priority and delay",
        ["P1 delay 0", "P2 delay 0", "P2 after delay", "Offer", "Agent"],
        "Priority and delay together decide which queue is eligible. A higher number is not automatically first.",
        "Routing profiles", DOC + "routing-profiles.html",
    ))
    diagrams.append(_flow(
        "cutover", "Migration cutover",
        ["Freeze", "Port", "Prove 443", "Prove 3478", "Shift"],
        "Cutover is a checklist: freeze changes, move the number, prove signaling and media, then shift traffic.",
        "Set up your network", NET,
    ))
    tree = (
        _box(300, 16, 160, 40, "No audio", "#f472b6")
        + _box(40, 90, 180, 40, "Mic permission")
        + _box(280, 90, 200, 40, "UDP 3478")
        + _box(540, 90, 180, 40, "VPN on media")
        + '<path d="M380,56 V78 H130 V90 M380,78 H380 V90 M380,78 H630 V90" fill="none" stroke="#ffb020" stroke-width="3"/>'
        + _token("M380,56 V78 H130 V90", "4.5s")
    )
    diagrams.append(_item(
        "trouble-tree", "No-audio troubleshooting tree", "flow",
        _frame(tree, "No-audio troubleshooting tree"),
        "Available and silent is a media problem until proven otherwise: microphone, then UDP 3478, then a VPN on the media path.",
        "CCP issues", DOC + "common-ccp-issues.html", True,
    ))
    diagrams.append(_flow(
        "outbound-campaign", "Outbound campaign",
        ["Campaign", "Customer", "Answer", "Flow", "Agent"],
        "Campaign concurrency defaults to 0. Extra calls hear a fast busy until the quota is raised.",
        "Service quotas", QUOTA,
    ))
    diagrams.append(_flow(
        "ctr-delivery", "Contact record delivery",
        ["Contact end", "CTR", "Kinesis", "Consumer", "Lake"],
        "One shard and two consumers stall delivery. The record is not the recording.",
        "Contact records", DOC + "ctr-data-model.html",
    ))
    diagrams.append(_flow(
        "chat-ingress", "Chat into the same queue",
        ["Widget", "Origin", "Flow", "Queue", "Agent"],
        "The chat widget needs an allowed origin. Idle chats still count toward the default of 500.",
        "Service quotas", QUOTA,
    ))
    diagrams.append(_flow(
        "external-transfer", "Transfer to an external number",
        ["Agent", "Quick connect", "PSTN", "Far end", "Not a trunk"],
        "Transfer to phone number leaves Connect. It is not a CUCM SIP trunk inside the flow designer.",
        "Transfer to phone number", DOC + "transfer-to-phone-number.html",
    ))
    diagrams.append(_flow(
        "resiliency-shift", "Traffic shift in 10 percent steps",
        ["Region A", "10%", "20%", "Linked pair", "Region B"],
        "Traffic distribution moves in 10 percent steps. Osaka delivery for the Tokyo pair can take up to 20 seconds.",
        "Set up Global Resiliency", GR,
    ))
    diagrams.append(_flow(
        "e911-933", "Emergency address, test with 933",
        ["Profile", "Validate", "Store", "933", "Not live 911"],
        "US CCP agents: validate the address, store it, and read it back with 933. This campus never places a live 911 call.",
        "US emergency calling", E911,
    ))
    diagrams.append(_flow(
        "recording-path", "Recording path",
        ["Contact", "Record", "S3", "Screen", "KVS"],
        "Voice recording lands in S3. A live third-party recorder uses Kinesis Video Streams. Screen recording is its own setting.",
        "Recording", DOC + "set-up-recording.html",
    ))
    diagrams.append(_flow(
        "agent-assist", "Agent assist beside the flow",
        ["Utterance", "Assist", "Suggestion", "Agent", "Person still owns it"],
        "On 4 August 2026 the admin guide renamed Amazon Q in Connect to agent assist. The agent can still ignore the suggestion.",
        "Timeline citing document history, 4 Aug 2026",
        "https://hidekazu-konishi.com/entry/aws_history_and_timeline_amazon_connect.html",
    ))

    arch = (
        _box(300, 86, 150, 48, "Connect", "#ffb020")
        + _box(40, 24, 120, 40, "Lex")
        + _box(590, 24, 130, 40, "Lambda")
        + _box(40, 156, 160, 40, "Analytics")
        + _box(560, 156, 160, 40, "Kinesis")
        + _box(320, 16, 110, 36, "CCP")
        + '<g stroke="#2dd4bf" stroke-width="2" fill="none">'
        + '<line x1="375" y1="86" x2="100" y2="64"/><line x1="450" y1="86" x2="655" y2="64"/>'
        + '<line x1="375" y1="134" x2="120" y2="156"/><line x1="450" y1="134" x2="640" y2="156"/>'
        + '<line x1="375" y1="52" x2="375" y2="86"/></g>'
    )
    diagrams.append(_item(
        "architecture", "Instance architecture", "diagram",
        _frame(arch, "Instance architecture"),
        "Connect in the middle. Lex, Lambda, Kinesis, conversational analytics, and the CCP around it. Open the 3D map to orbit the same picture.",
        "Set up your network", NET, False,
    ))
    diagrams.append(_item(
        "deployment", "Repeatable deployment", "diagram",
        _frame("".join([
            _box(24, 80, 150, 48, "Console"),
            _box(210, 80, 160, 48, "CloudFormation"),
            _box(410, 80, 120, 48, "CDK"),
            _box(570, 80, 160, 48, "Terraform"),
        ]) + '<text x="24" y="170" fill="#f3efe4" font-size="14" font-family="ui-sans-serif,system-ui,sans-serif">Same instance shape, four ways to create it. Every lesson has an IaC tab.</text>',
               "Repeatable deployment"),
        "Create the instance on purpose, then repeat it. The campus ships a CloudFormation and CDK sketch per track.",
        "Create an instance", DOC + "connect-instances.html", False,
    ))
    fw = (
        '<text x="24" y="36" fill="#f3efe4" font-size="16" font-family="ui-sans-serif,system-ui,sans-serif">Firewall matrix, outbound from the agent PC</text>'
        + _box(24, 64, 220, 56, "TCP 443 signaling", "#ffb020")
        + _box(270, 64, 220, 56, "UDP 3478 media", "#2dd4bf")
        + _box(516, 64, 220, 56, "Ephemeral UDP return", "#f472b6")
        + '<text x="24" y="168" fill="#f3efe4" font-size="14" font-family="ui-sans-serif,system-ui,sans-serif">A stateless firewall also needs the browser ephemeral UDP range. That range is OS-dependent. This lab does not invent the numbers.</text>'
    )
    diagrams.append(_item(
        "firewall-matrix", "Firewall matrix", "diagram",
        _frame(fw, "Firewall matrix", h=200),
        "TCP 443 to the instance. UDP 3478 to TurnNlb. Stateless return traffic is real, and the ephemeral range is not a single published port.",
        "Set up your network", NET, False,
    ))
    diagrams.append(_item(
        "hours-queue", "Hours gate the queue", "diagram",
        _frame(
            _box(30, 70, 140, 48, "Number")
            + _box(210, 70, 140, 48, "Flow")
            + _box(390, 70, 160, 48, "Hours check")
            + _box(590, 70, 140, 48, "Queue or closed")
            + '<text x="30" y="160" fill="#f3efe4" font-size="14" font-family="ui-sans-serif,system-ui,sans-serif">Holiday overrides win over the weekly hours. A closed queue is a flow decision, not a dead number.</text>',
            "Hours gate the queue",
        ),
        "Hours of operation, including overrides, decide whether the flow offers the queue.",
        "Hours of operation", DOC + "set-hours-operation.html", False,
    ))
    diagrams.append(_item(
        "iam-vs-profile", "IAM is not a security profile", "diagram",
        _frame(
            _box(40, 60, 300, 90, "IAM: AWS API", "#ffb020")
            + _box(420, 60, 300, 90, "Security profile: admin site", "#2dd4bf")
            + '<text x="40" y="190" fill="#f3efe4" font-size="14" font-family="ui-sans-serif,system-ui,sans-serif">One grants AWS APIs. The other grants buttons in the Connect admin website and the CCP.</text>',
            "IAM is not a security profile",
        ),
        "A security profile does not replace an IAM policy, and an IAM policy does not click the admin website for you.",
        "Security profiles", DOC + "security-profiles.html", False,
    ))
    diagrams.append(_item(
        "salesforce", "Salesforce beside Connect", "diagram",
        _frame(
            _box(40, 80, 180, 48, "Salesforce")
            + _box(280, 80, 180, 48, "CTI Adapter")
            + _box(520, 80, 200, 48, "Connect CCP")
            + '<text x="40" y="170" fill="#f3efe4" font-size="14" font-family="ui-sans-serif,system-ui,sans-serif">The published pattern is the CTI adapter or SCC-AC. It is not a SIP trunk drawn into the CRM.</text>',
            "Salesforce beside Connect",
        ),
        "Salesforce is a real customer integration via the CTI Adapter or Service Cloud Voice for Amazon Connect.",
        "Salesforce CTI Adapter",
        "https://github.com/amazon-connect/amazon-connect-salesforce-cti",
        False,
    ))
    diagrams.append(_item(
        "wfm", "Forecasting and agent scheduling", "diagram",
        _frame(
            _box(30, 80, 150, 48, "History")
            + _box(210, 80, 160, 48, "Forecast")
            + _box(400, 80, 160, 48, "Capacity")
            + _box(590, 80, 140, 48, "Schedule")
            + '<text x="30" y="168" fill="#f3efe4" font-size="14" font-family="ui-sans-serif,system-ui,sans-serif">4 Aug 2026 name: forecasting and agent scheduling. Third parties can still read agent events.</text>',
            "Forecasting and agent scheduling",
        ),
        "Native WFM is forecasting and agent scheduling. A third-party WFM reads agent events instead of replacing the queue.",
        "Forecasting and scheduling", DOC + "forecasting-capacity-planning-scheduling.html", False,
    ))
    diagrams.append(_item(
        "renames-2026", "4 August 2026 renames", "diagram",
        _frame(
            _box(24, 36, 220, 64, "Contact Lens", "#64748b")
            + _box(270, 36, 220, 64, "Amazon Q", "#64748b")
            + _box(516, 36, 220, 64, "Voice+", "#64748b")
            + _box(24, 124, 220, 64, "Analytics", "#2dd4bf")
            + _box(270, 124, 220, 64, "Agent assist", "#2dd4bf")
            + _box(516, 124, 220, 64, "Live Sync", "#2dd4bf"),
            "4 August 2026 renames", h=210,
        ),
        "Document history on 4 August 2026: conversational analytics, agent assist, and Live Sync. Voice ID had already ended on 20 May 2026.",
        "Timeline citing document history, 4 Aug 2026",
        "https://hidekazu-konishi.com/entry/aws_history_and_timeline_amazon_connect.html",
        False,
    ))
    diagrams.append(_item(
        "number-types", "Number types", "diagram",
        _frame("".join([
            _box(24, 70, 160, 48, "DID"),
            _box(210, 70, 160, 48, "Toll-free"),
            _box(396, 70, 160, 48, "Shared cost"),
            _box(582, 70, 150, 48, "UIFN"),
        ]) + '<text x="24" y="160" fill="#f3efe4" font-size="14" font-family="ui-sans-serif,system-ui,sans-serif">Each type has its own price unit. The default phone-number quota is 10, and the first claim can still fail.</text>',
               "Number types"),
        "DID, toll-free, shared cost, and UIFN. Connect does not offer a CUCM-style SIP trunk page.",
        "Request phone numbers", DOC + "request-phone-number.html", False,
    ))
    diagrams.append(_item(
        "routing-profile", "What a routing profile holds", "diagram",
        _frame(
            _box(40, 50, 200, 120, "Profile")
            + _box(300, 40, 200, 44, "Queues")
            + _box(300, 96, 200, 44, "Channels")
            + _box(300, 152, 200, 44, "Concurrency")
            + _box(530, 96, 190, 44, "Priority + delay")
            + '<text x="40" y="206" fill="#f3efe4" font-size="13" font-family="ui-sans-serif,system-ui,sans-serif">50 queue-channel combinations per profile. Manual assignment queues count separately.</text>',
            "What a routing profile holds",
        ),
        "A routing profile is queues, channels, concurrency, priority, and delay. It is not a CUCM calling search space.",
        "Routing profiles", DOC + "routing-profiles.html", False,
    ))
    diagrams.append(_item(
        "region-pair", "Global Resiliency pair", "diagram",
        _frame(
            _box(40, 70, 200, 56, "Source Region")
            + _box(500, 70, 220, 56, "Replica Region")
            + '<path d="M240,98 H500" stroke="#ffb020" stroke-width="3"/>'
            + '<text x="300" y="88" fill="#ffb020" font-size="13" font-family="ui-sans-serif,system-ui,sans-serif">linked pair</text>'
            + '<text x="40" y="170" fill="#f3efe4" font-size="14" font-family="ui-sans-serif,system-ui,sans-serif">Lambda and numbers have to exist in both Regions before a drill. Traffic shifts in 10 percent steps.</text>',
            "Global Resiliency pair",
        ),
        "Global Resiliency is a published Region pair, not an any-to-any mesh. Cross-region routing was added 31 August 2026.",
        "Set up Global Resiliency", GR, False,
    ))
    diagrams.append(_item(
        "ecosystem-map", "Ecosystem around the queue", "diagram",
        _frame("".join([
            _box(280, 80, 180, 48, "Queue", "#ffb020"),
            _box(30, 24, 140, 40, "WFM"),
            _box(190, 24, 150, 40, "Recording"),
            _box(360, 24, 120, 40, "E911"),
            _box(500, 24, 110, 40, "CRM"),
            _box(630, 24, 110, 40, "Assist"),
            _box(250, 156, 240, 40, "Conversational analytics"),
        ]), "Ecosystem around the queue"),
        "WFM, recording, E911, CRM, agent assist, and conversational analytics sit beside the queue. They are not extra queues.",
        "Amazon Connect admin guide", DOC, False,
    ))

    charts = [
        _item(
            "chart-concurrency", "Default concurrent contacts", "chart",
            _bars("Default concurrent contacts", [
                ("Calls", 10, "10"),
                ("Real-time analytics", 300, "300"),
                ("Chats", 500, "500"),
                ("Emails", 1000, "1000"),
                ("Tasks", 2500, "2500"),
            ], "active"),
            "Service quotas, defaults. Chats include SMS, WhatsApp, Apple Messages, and idle chats. Calls include PSTN and WebRTC.",
            "Service quotas", QUOTA,
        ),
        _item(
            "chart-resources", "Default resource caps", "chart",
            _bars("Default resource caps per instance", [
                ("Phone numbers", 10, "10"),
                ("Flows", 100, "100"),
                ("Queues", 100, "100"),
                ("Modules", 200, "200"),
                ("Users", 500, "500"),
                ("Profiles", 500, "500"),
            ], "each"),
            "Phone numbers default to 10. Users and routing profiles default to 500. All 500 users may be signed in together.",
            "Service quotas", QUOTA,
        ),
        _item(
            "chart-voice-price", "Voice list price per minute", "chart",
            _bars("Voice, USD per minute x 1000", [
                ("Basic voice", 18, "0.018"),
                ("Customer voice", 38, "0.038"),
                ("External connector", 32, "0.032"),
                ("Campaign voice", 45, "0.045"),
            ], "USD/min", 50),
            "Appendix worked examples read 14 October 2026. Telephony is extra. External voice connector is also 100 USD per connector per day, which is a different unit and is not on this bar.",
            "Pricing appendix, 14 Oct 2026", PRICE,
        ),
        _item(
            "chart-message-price", "Message and email list price", "chart",
            _bars("Per message or email, USD x 1000", [
                ("Basic chat", 4, "0.004"),
                ("Customer chat", 10, "0.010"),
                ("SMS", 14, "0.014"),
                ("Basic email", 50, "0.050"),
                ("Customer email", 80, "0.080"),
            ], "USD", 90),
            "Chat is per message. Email is per email. SMS is before delivery fees. Dated 14 October 2026.",
            "Pricing appendix, 14 Oct 2026", PRICE,
        ),
        _item(
            "chart-surprise", "Defaults that surprise a design", "chart",
            _bars("Defaults that surprise a design", [
                ("Campaign calls", 0, "0"),
                ("Instances / Region", 2, "2"),
                ("AI assistants", 5, "5"),
                ("Phone numbers", 10, "10"),
                ("Knowledge bases", 10, "10"),
            ], "default", 12),
            "Campaign concurrency 0 means a fast busy until you raise it. The zero bar is drawn on purpose.",
            "Service quotas", QUOTA,
        ),
        _item(
            "chart-eighty", "Two different 80 percents", "chart",
            _bars("Percent", [
                ("Badge pass mark", 80, "80"),
                ("Quota alarm habit", 80, "80"),
            ], "percent", 100),
            "Skill Builder badges pass at 80 percent. Alarming at 80 percent of a quota is an operating habit from this campus, not an AWS exam rule. They are not the same 80.",
            "Connect learning badges", BADGE,
        ),
        _item(
            "chart-timing", "Two published waits", "chart",
            _bars("Seconds", [
                ("Sync Lambda cap", 8, "8"),
                ("Osaka delivery, up to", 20, "20"),
            ], "seconds", 24),
            "The Lambda function block documents 8 seconds for a synchronous invoke. Global Resiliency documents up to 20 seconds of delivery through Osaka for the Tokyo pair.",
            "Invoke Lambda function block", LAMBDA,
        ),
    ]
    attached = {
        "chart-concurrency": ("active", [("Calls", 10, "10"), ("Real-time analytics", 300, "300"), ("Chats", 500, "500"), ("Emails", 1000, "1000"), ("Tasks", 2500, "2500")]),
        "chart-resources": ("each", [("Phone numbers", 10, "10"), ("Flows", 100, "100"), ("Queues", 100, "100"), ("Modules", 200, "200"), ("Users", 500, "500"), ("Profiles", 500, "500")]),
        "chart-voice-price": ("USD/min", [("Basic voice", 18, "0.018"), ("Customer voice", 38, "0.038"), ("External connector", 32, "0.032"), ("Campaign voice", 45, "0.045")]),
        "chart-message-price": ("USD", [("Basic chat", 4, "0.004"), ("Customer chat", 10, "0.010"), ("SMS", 14, "0.014"), ("Basic email", 50, "0.050"), ("Customer email", 80, "0.080")]),
        "chart-surprise": ("default", [("Campaign calls", 0, "0"), ("Instances / Region", 2, "2"), ("AI assistants", 5, "5"), ("Phone numbers", 10, "10"), ("Knowledge bases", 10, "10")]),
        "chart-eighty": ("percent", [("Badge pass mark", 80, "80"), ("Quota alarm habit", 80, "80")]),
        "chart-timing": ("seconds", [("Sync Lambda cap", 8, "8"), ("Osaka delivery, up to", 20, "20")]),
    }
    for chart in charts:
        unit, rows = attached[chart["id"]]
        chart["unit"] = unit
        chart["points"] = [{"label": label, "value": value, "shown": shown} for label, value, shown in rows]
    return {"diagrams": diagrams, "charts": charts}
