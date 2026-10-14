"""Distinct figures, animated flows, charts, tones, and the fault catalog."""
import hashlib
import html
import io
import math
import wave
from base64 import b64encode

DOC = "https://docs.aws.amazon.com/connect/latest/adminguide/"

FAULTS = [
    ("softphone-turn", "Failed to establish softphone connection", "The browser cannot open media to the Regional TurnNlb endpoint.", "Allow outbound UDP 3478 to TurnNlb in the instance Region and rerun the Endpoint Connectivity tool on that PC.", DOC + "common-ccp-issues.html", "CCP issues", "Softphone", "Endpoint Connectivity tool"),
    ("ice-timeout", "ice_collection_timeout", "ICE candidate collection timed out before a media channel existed.", "Check DNS for TurnNlb, UDP 3478, and any VPN or proxy on the media path.", DOC + "ccp-uses-webrtc.html", "How CCP uses WebRTC", "Browser", "CCP error text"),
    ("one-way", "One-way audio", "Signaling is up and media is not, usually NAT or a stateless firewall.", "Allow the browser ephemeral UDP range back in. Take the VPN off the media path.", DOC + "network-ts.html", "Network troubleshooting", "Media path", "Compare VPN on and off"),
    ("lambda-denied", "Lambda AccessDenied in the flow log", "Connect could not invoke the function. The Lambda log is empty.", "Associate the function with the instance and allow principal connect.amazonaws.com to invoke that alias.", "https://repost.aws/knowledge-center/connect-lambda-function-failures", "re:Post, Lambda failures", "Invoke", "Flow log Results field"),
    ("lambda-8s", "Lambda runs longer than the block waits", "A synchronous block waits at most 8 seconds, even if the function timeout is longer.", "Return inside 8 seconds, or switch the block to asynchronous and play a prompt.", DOC + "invoke-lambda-function-block.html", "Lambda function block", "Lambda", "Duration beside the block timeout"),
    ("string-map", "Response is not a string map", "The block expected a flat object of strings and received nested JSON or a large payload.", "Match the block's response validation. Keep the payload small.", "https://repost.aws/knowledge-center/connect-contact-flow-errors", "re:Post, flow errors", "Return shape", "The returned JSON"),
    ("claim-limit", "You've reached the limit of Phone Numbers", "The first claim can show this message even when the instance has zero numbers.", "Open a Support case. Do not keep clicking claim.", DOC + "amazon-connect-service-limits.html", "Service quotas", "Telephony quota", "The console message"),
    ("campaign-busy", "Fast busy on a campaign call", "Concurrent campaign calls default to 0.", "Raise the campaign concurrency quota before the run.", DOC + "amazon-connect-service-limits.html", "Service quotas", "Campaign quota", "Applied quota value"),
    ("chat-idle", "Chat starts fail while agents look idle", "Idle chats still count toward the concurrent chat quota of 500.", "Close or persist idle chats, and alarm at 80 percent.", DOC + "amazon-connect-service-limits.html", "Service quotas", "Chat quota", "Concurrent chats metric"),
    ("recording-missing", "Recording missing from S3", "The recording block was off, or the bucket policy or KMS key policy rejected the write.", "Confirm the block, the storage config, and the key policy, then place one new test call.", DOC + "set-recording-behavior.html", "Recording behavior", "Storage", "Recording.Location on the CTR"),
    ("ctr-delay", "CTR missing after one minute", "Firehose buffers. Five quiet minutes is the point to inspect errors.", "Check the delivery-stream error prefix and the S3 destination.", "https://repost.aws/knowledge-center/connect-integrate-kinesis", "re:Post, Kinesis", "CTR delivery", "Firehose error objects"),
    ("saml-profile", "SAML user has no routing profile", "The assertion did not map a role, security profile, and routing profile the instance accepts.", "Fix one user, place one test call, then federate the group.", DOC + "configure-saml.html", "Configure SAML", "Identity", "IdP assertion and the user profile"),
    ("error-branch", "Caller hangs up on an error with no prompt", "An error output is not connected, so Connect ends the contact.", "Connect every error, timeout, and default branch. Turn logging on first.", "https://repost.aws/knowledge-center/connect-contact-flow-errors", "re:Post, flow errors", "Flow", "Last block in the flow log"),
    ("queue-order", "Transfer to queue does nothing useful", "Set working queue was skipped, or it sits after the transfer.", "Set the queue, then transfer.", DOC + "transfer-to-queue.html", "Transfer to queue", "Flow order", "Flow log block order"),
    ("priority", "The overflow team takes every call", "Their queue is priority 1 or their delay is 0.", "Give primary agents the lower priority number and a delay of 0. Give overflow a higher number and a delay.", DOC + "concepts-routing.html", "Routing profiles", "Routing", "Profile priority and delay"),
    ("replica-numbers", "Replica Region has no numbers", "Numbers were not in a traffic distribution group. Osaka only fully replicates numbers enabled for Global Resiliency.", "Associate the numbers, then place a call after a 10 percent shift.", DOC + "create-replica-connect-instance.html", "Create a replica", "Resiliency", "Which Region answered"),
    ("medialess", "Custom CCP loads and audio never starts", "amazon-connect-streams can run media-less. Media still needs the softphone allow list.", "Initialize with softphone options and test UDP 3478.", DOC + "ccp-networking.html", "Set up your network", "Streams", "Init options and the endpoint tool"),
    ("proxy-errors", "Error rate above 2 percent on the domain allow list", "A proxy cannot resolve the WebSocket or TURN domains.", "Test more than 200 calls. Review proxy DNS if the error rate stays above 2 percent.", DOC + "ccp-networking.html", "Set up your network", "Proxy", "Error rate over 200 calls"),
    ("email-split", "An email reply became a new contact", "Replies after 90 days start a new thread.", "Expect a new thread on day 91. Set contact expiry on purpose if you need longer than 14 days, never past 90.", DOC + "amazon-connect-service-limits.html", "Service quotas", "Email", "Thread age"),
    ("voiceid-dead", "Voice ID block fails in a 2026 flow", "Support ended 20 May 2026. New customers stopped 20 May 2025.", "Remove the Voice ID blocks. Use a partner or a one-time password.", DOC + "amazonconnect-voiceid-end-of-support.html", "Voice ID end of support", "Flow", "Block type in the flow JSON"),
    ("dns-turn", "TurnNlb does not resolve", "The workstation DNS cannot answer the Regional TURN name, so ICE never gathers candidates.", "Resolve the TurnNlb name from the agent PC, not from a jump host.", DOC + "ccp-uses-webrtc.html", "How CCP uses WebRTC", "DNS", "nslookup of the TURN name"),
    ("mic-denied", "CCP shows available and the microphone is blocked", "The browser never received microphone permission, so the softphone cannot capture audio.", "Allow the microphone for the instance origin and reload the CCP.", DOC + "ccp-networking.html", "Set up your network", "Browser permission", "Site permission for the microphone"),
    ("hours-zone", "Midnight callers reach a closed queue that the prompt calls open", "Check hours uses the queue time zone. The tester's laptop zone is irrelevant.", "Read the hours object zone and today's override before editing the prompt.", DOC + "set-hours-operation.html", "Hours of operation", "Hours", "Queue time zone and the branch taken"),
    ("holiday", "A holiday still follows the weekly hours", "The override does not include that date, or the quota of 50 overrides hid the one you needed.", "Open the override for the date and place a test call that the log shows as out of hours.", DOC + "set-hours-operation.html", "Hours of operation", "Override", "Override list for that date"),
    ("lex-alias", "Lex works in its console and errors on the call", "The bot alias is not associated with the instance, or the block selects a different alias.", "Associate the alias, select it on Get customer input, and test speech and DTMF.", DOC + "contact-block-definitions.html", "Get customer input", "Lex", "Alias association and the error branch"),
    ("widget-origin", "The chat widget does not start", "The page origin is not allowed for the widget.", "Add the origin, then start one chat and read the browser console for the blocked frame.", DOC + "amazon-connect-service-limits.html", "Service quotas", "Chat widget", "Page origin against the allow list"),
    ("pstn-attributes", "The CUCM agent has a blank screen pop", "Transfer to phone number leaves Connect. Attributes do not ride the PSTN.", "Pop before the transfer, or keep the second leg inside Connect.", DOC + "transfer-to-phone-number.html", "Transfer to phone number", "Transfer", "Attributes present before the transfer"),
    ("household-ani", "Salesforce pops the wrong person", "The match used ANI on a number shared by a household.", "Match the account id collected in the flow, and write that attribute before the queue.", DOC + "salesforce-integration.html", "Salesforce integration", "Screen pop", "Attribute name in the flow and in the layout"),
    ("adherence-blank", "WFM adherence is blank on day one", "Agent events are missing, statuses are unmapped, or the schedule was never published.", "Confirm one status-change event, the status map, and a published schedule.", DOC + "agent-event-streams.html", "Agent event streams", "WFM", "One agent event and the schedule state"),
    ("no-transcript", "Analytics search returns nothing for a known call", "The recording and analytics block never ran, or the post-contact job is still working.", "Enable the block, place a call that says a known phrase, then search.", DOC + "amazon-connect-service-limits.html", "Conversational analytics quotas", "Analytics", "Whether the block ran"),
    ("e911-hq", "A home agent's 911 address is the headquarters", "The stored profile address was never updated when the agent left the office.", "Validate the current address, store it on that agent's profile, and test with 933.", DOC + "setup-us-emergency-calling.html", "US emergency calling", "E911", "933 readback"),
    ("shard-lag", "The second WFM consumer is minutes behind", "One Kinesis shard is serving two consumers.", "Give each consumer its own iterator and add shards when iterator age grows.", DOC + "agent-event-streams.html", "Agent event streams", "Kinesis", "Iterator age"),
    ("caller-id", "Outbound calls fail or show the wrong number", "The queue caller ID is empty or is a number you may not present.", "Set a claimed number the queue is allowed to present, then place one outbound call.", DOC + "concepts-telephony.html", "Voice channel", "Outbound", "Queue caller ID"),
    ("callback-empty", "Callbacks sit forever", "The callback entered a queue that no routing profile staffs.", "Put the queue on a profile with agents in Available, then watch one callback connect.", DOC + "transfer-to-queue.html", "Transfer to queue", "Callback", "Queue staffed count"),
    ("logging-off", "A failed ContactId has no flow log", "Set logging behavior is off, or a later block turned it off.", "Turn logging on in a module every flow invokes, then repeat the test.", "https://repost.aws/knowledge-center/connect-contact-flow-errors", "re:Post, flow errors", "Logs", "Log group for that ContactId"),
    ("replica-lambda", "Failover flows take the Lambda error branch", "The function exists in the source Region only.", "Deploy the same alias in the replica Region and associate it before the drill.", DOC + "setup-connect-global-resiliency.html", "Set up Global Resiliency", "Replica", "Invoke in each Region"),
    ("prompt-replica", "Failover plays silence where a prompt should be", "A prompt that lives only as an object you uploaded is not fully replicated the way built-in prompts are.", "Re-test every custom prompt in the replica and keep the file in the pipeline.", DOC + "create-replica-connect-instance.html", "Create a replica", "Prompts", "Prompt playback in both Regions"),
    ("task-acw", "New tasks will not route", "Active tasks include after-contact work, and the 2500 concurrent quota is full of ACW.", "Finish or expire ACW, and alarm on concurrent tasks.", DOC + "amazon-connect-service-limits.html", "Service quotas", "Tasks", "Concurrent tasks including ACW"),
    ("recording-acl", "Every agent can play every recording", "The security profile grants recording access to the agent role.", "Split a listener profile from the agent profile and retest with an agent login.", DOC + "security-profile-list.html", "Security profiles", "Access", "Security profile permissions"),
    ("percent-split", "Distribute by percentage is being used as skills routing", "That block sends a share of contacts down a branch. It does not look at proficiency.", "Use routing criteria or profile priority. Keep percentage for a measured pilot only.", DOC + "contact-block-definitions.html", "Distribute by percentage", "Routing", "Which block is splitting traffic"),
]


def _rng(seed):
    state = int(hashlib.sha256(seed.encode()).hexdigest()[:8], 16) or 1

    def nxt():
        nonlocal state
        state = (1664525 * state + 1013904223) & 0xFFFFFFFF
        return state / 0xFFFFFFFF

    return nxt


def _e(text):
    return html.escape(str(text), quote=True)


def _wrap(width, height, body, label):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="{_e(label)}">{body}</svg>'
    )


def _palette(rnd):
    sets = [
        ("#e5843b", "#3dcfb4", "#f0c56a", "#8eb8ff"),
        ("#ff6d6d", "#f0c56a", "#3dcfb4", "#c4b5fd"),
        ("#8eb8ff", "#e5843b", "#3dcfb4", "#ffc091"),
        ("#3dcfb4", "#c4b5fd", "#f0c56a", "#ff8a5b"),
    ]
    return sets[int(rnd() * len(sets)) % len(sets)]


def compose_metro(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    width, height = 680, 250
    count = max(3, min(7, len(labels)))
    points = []
    for i in range(count):
        x = 48 + i * ((width - 96) / max(1, count - 1))
        y = 70 + math.sin(i * (1.1 + rnd()) + rnd() * 3) * (28 + rnd() * 36) + rnd() * 10
        points.append((x, y))
    d = "M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in points)
    parts = [f'<path d="{d}" fill="none" stroke="{colors[0]}" stroke-width="6" stroke-linecap="round"/>']
    for i, (x, y) in enumerate(points):
        shape = int(rnd() * 3)
        if shape == 0:
            parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{16 + rnd() * 8:.1f}" fill="#10202b" stroke="{colors[1]}" stroke-width="3"/>')
        elif shape == 1:
            s = 18 + rnd() * 8
            parts.append(f'<rect x="{x - s:.1f}" y="{y - s:.1f}" width="{s * 2:.1f}" height="{s * 2:.1f}" rx="6" fill="#10202b" stroke="{colors[2]}" stroke-width="3"/>')
        else:
            parts.append(f'<polygon points="{x:.1f},{y - 18:.1f} {x + 16:.1f},{y + 12:.1f} {x - 16:.1f},{y + 12:.1f}" fill="#10202b" stroke="{colors[3]}" stroke-width="3"/>')
        parts.append(f'<text x="{x:.1f}" y="{210 if y < 140 else 40}" text-anchor="middle" fill="#f3efe4" font-size="13" font-family="Palatino, Georgia, serif">{_e(labels[i][:22])}</text>')
    parts.append(f'<text x="24" y="{height - 16}" fill="#93a8ad" font-size="12">{_e(caption[:90])}</text>')
    return _wrap(width, height, "".join(parts), caption)


def compose_decision(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    width, height = 680, 300
    parts = []
    cx, cy = 340, 78
    parts.append(f'<polygon points="{cx},{cy - 46} {cx + 70},{cy} {cx},{cy + 46} {cx - 70},{cy}" fill="#10202b" stroke="{colors[0]}" stroke-width="3"/>')
    parts.append(f'<text x="{cx}" y="{cy + 4}" text-anchor="middle" fill="#f3efe4" font-size="13">{_e(labels[0][:18])}</text>')
    leaves = labels[1:5] or ["Yes", "No", "Timeout", "Error"]
    for i, leaf in enumerate(leaves):
        x = 80 + i * 160
        y = 210
        parts.append(f'<path d="M {cx} {cy + 46} C {cx + (i - 1.5) * 40:.0f} 150, {x} 160, {x} {y - 28}" fill="none" stroke="{colors[1 + (i % 3)]}" stroke-width="3"/>')
        parts.append(f'<rect x="{x - 62}" y="{y - 24}" width="124" height="48" rx="12" fill="#10202b" stroke="{colors[i % 4]}"/>')
        parts.append(f'<text x="{x}" y="{y + 4}" text-anchor="middle" fill="#f3efe4" font-size="12">{_e(leaf[:16])}</text>')
    parts.append(f'<text x="20" y="{height - 14}" fill="#93a8ad" font-size="12">{_e(caption[:88])}</text>')
    return _wrap(width, height, "".join(parts), caption)


def compose_radial(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    width, height = 640, 360
    cx, cy = 320, 168
    radius = 96 + rnd() * 36
    parts = [f'<circle cx="{cx}" cy="{cy}" r="{28 + rnd() * 10:.0f}" fill="{colors[0]}"/>', f'<text x="{cx}" y="{cy + 4}" text-anchor="middle" fill="#1a0d06" font-size="12">Core</text>']
    count = max(4, min(8, len(labels)))
    for i in range(count):
        angle = (-math.pi / 2) + i * (math.tau / count) + rnd() * 0.2
        x = cx + math.cos(angle) * radius
        y = cy + math.sin(angle) * (radius * (0.72 + rnd() * 0.2))
        parts.append(f'<line x1="{cx}" y1="{cy}" x2="{x:.1f}" y2="{y:.1f}" stroke="{colors[i % 4]}" stroke-width="2"/>')
        parts.append(f'<rect x="{x - 54:.1f}" y="{y - 16:.1f}" width="108" height="32" rx="10" fill="#10202b" stroke="{colors[i % 4]}"/>')
        parts.append(f'<text x="{x:.1f}" y="{y + 4:.1f}" text-anchor="middle" fill="#f3efe4" font-size="11">{_e(labels[i % len(labels)][:14])}</text>')
    parts.append(f'<text x="16" y="{height - 16}" fill="#93a8ad" font-size="12">{_e(caption[:80])}</text>')
    return _wrap(width, height, "".join(parts), caption)


def compose_swim(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    lanes = labels[:4] if len(labels) >= 3 else labels + ["Queue", "Agent"]
    height = 64 + len(lanes) * 70
    width = 700
    parts = []
    for i, lane in enumerate(lanes):
        y = 24 + i * 70
        parts.append(f'<rect x="16" y="{y}" width="{width - 32}" height="60" rx="12" fill="#10202b" stroke="{colors[i % 4]}"/>')
        parts.append(f'<text x="32" y="{y + 36}" fill="#f3efe4" font-size="16" font-family="Palatino, Georgia, serif">{_e(lane[:28])}</text>')
        parts.append(f'<circle cx="{width - 70}" cy="{y + 30}" r="{8 + rnd() * 8:.0f}" fill="{colors[(i + 1) % 4]}"/>')
        if i:
            parts.append(f'<path d="M {width - 70} {y - 10} v -20" stroke="{colors[0]}" stroke-width="2" marker-end="none"/>')
    parts.append(f'<text x="20" y="{height - 8}" fill="#93a8ad" font-size="12">{_e(caption[:80])}</text>')
    return _wrap(width, height + 16, "".join(parts), caption)


def compose_bars(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    vals = [0.25 + rnd() * 0.75 for _ in labels[:6]]
    if not vals:
        vals = [0.4, 0.7, 0.5]
        labels = ["A", "B", "C"]
    width, height = 680, 40 + len(vals) * 36 + 28
    parts = []
    for i, val in enumerate(vals):
        y = 16 + i * 36
        bar = 40 + val * 460
        parts.append(f'<text x="12" y="{y + 16}" fill="#c9d2cf" font-size="12">{_e(labels[i][:18])}</text>')
        parts.append(f'<rect x="160" y="{y}" width="{bar:.0f}" height="18" rx="9" fill="{colors[i % 4]}"/>')
        parts.append(f'<text x="{168 + bar:.0f}" y="{y + 14}" fill="#f3efe4" font-size="11">{int(val * 100)}</text>')
    parts.append(f'<text x="12" y="{height - 8}" fill="#93a8ad" font-size="12">{_e(caption[:80])}</text>')
    return _wrap(width, height, "".join(parts), caption)


def compose_wave(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    width, height = 680, 220
    pts = []
    for i in range(48):
        x = 20 + i * 13
        y = 110 + math.sin(i * (0.35 + rnd() * 0.25) + rnd() * 4) * (30 + rnd() * 28)
        pts.append(f"{x:.0f},{y:.0f}")
    parts = [f'<polyline points="{" ".join(pts)}" fill="none" stroke="{colors[0]}" stroke-width="3"/>']
    for i, label in enumerate(labels[:4]):
        x = 60 + i * 150
        parts.append(f'<line x1="{x}" y1="40" x2="{x}" y2="170" stroke="{colors[1]}" stroke-dasharray="3 4"/>')
        parts.append(f'<text x="{x}" y="28" text-anchor="middle" fill="#f3efe4" font-size="11">{_e(label[:14])}</text>')
    parts.append(f'<text x="16" y="{height - 10}" fill="#93a8ad" font-size="12">{_e(caption[:80])}</text>')
    return _wrap(width, height, "".join(parts), caption)


def compose_matrix(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    cols = max(4, min(8, 3 + int(rnd() * 5)))
    rows = max(3, min(6, 2 + int(rnd() * 4)))
    width, height = 40 + cols * 72, 50 + rows * 48
    parts = []
    for r in range(rows):
        for c in range(cols):
            on = rnd() > 0.45
            x, y = 16 + c * 72, 16 + r * 48
            fill = colors[(r + c) % 4] if on else "#10202b"
            parts.append(f'<rect x="{x}" y="{y}" width="64" height="36" rx="8" fill="{fill}" opacity="{1 if on else 0.45}"/>')
    if labels:
        parts.append(f'<text x="16" y="{height - 8}" fill="#f3efe4" font-size="12">{_e(labels[0][:40])}</text>')
    return _wrap(width, height + 8, "".join(parts), caption)


def compose_funnel(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    steps = labels[:5] or ["Calls", "Queue", "Answered"]
    width, height = 640, 40 + len(steps) * 52
    parts = []
    for i, label in enumerate(steps):
        inset = i * (18 + rnd() * 10)
        y = 16 + i * 50
        w = width - 80 - inset * 2
        parts.append(f'<rect x="{40 + inset:.0f}" y="{y}" width="{w:.0f}" height="40" rx="12" fill="#10202b" stroke="{colors[i % 4]}" stroke-width="3"/>')
        parts.append(f'<text x="{width / 2:.0f}" y="{y + 26}" text-anchor="middle" fill="#f3efe4" font-size="14">{_e(label[:24])}</text>')
    return _wrap(width, height, "".join(parts), caption)


def compose_gauge(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    width, height = 640, 230
    parts = []
    for i in range(3):
        cx = 110 + i * 200
        extent = 40 + rnd() * 220
        parts.append(f'<path d="M {cx - 70} 150 A 70 70 0 1 1 {cx + 70} 150" fill="none" stroke="#183142" stroke-width="14"/>')
        parts.append(f'<path d="M {cx - 70} 150 A 70 70 0 0 1 {cx - 70 + extent * 0.4:.0f} {40 + (i * 15)}" fill="none" stroke="{colors[i % 4]}" stroke-width="14" stroke-linecap="round"/>')
        parts.append(f'<text x="{cx}" y="170" text-anchor="middle" fill="#f3efe4" font-size="13">{_e((labels[i] if i < len(labels) else "Meter")[:16])}</text>')
    parts.append(f'<text x="16" y="{height - 12}" fill="#93a8ad" font-size="12">{_e(caption[:80])}</text>')
    return _wrap(width, height, "".join(parts), caption)


def compose_fish(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    width, height = 700, 260
    parts = [f'<line x1="40" y1="130" x2="640" y2="130" stroke="{colors[0]}" stroke-width="4"/>', f'<polygon points="640,130 600,108 600,152" fill="{colors[0]}"/>']
    bones = labels[:5] or ["Cause"]
    for i, label in enumerate(bones):
        up = i % 2 == 0
        x = 120 + i * 90
        y = 50 if up else 210
        parts.append(f'<line x1="{x}" y1="130" x2="{x + 30}" y2="{y}" stroke="{colors[1 + (i % 3)]}" stroke-width="3"/>')
        parts.append(f'<text x="{x + 36}" y="{y + (4 if up else 8)}" fill="#f3efe4" font-size="12">{_e(label[:18])}</text>')
    parts.append(f'<text x="40" y="248" fill="#93a8ad" font-size="12">{_e(caption[:70])}</text>')
    return _wrap(width, height, "".join(parts), caption)


def compose_ladder(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    actors = labels[:4] if len(labels) >= 2 else ["Flow", "Lambda", "Queue", "Agent"]
    width = 160 + len(actors) * 140
    height = 280
    xs = [80 + i * 150 for i in range(len(actors))]
    parts = []
    for i, actor in enumerate(actors):
        parts.append(f'<text x="{xs[i]}" y="28" text-anchor="middle" fill="#f3efe4" font-size="13">{_e(actor[:12])}</text>')
        parts.append(f'<line x1="{xs[i]}" y1="40" x2="{xs[i]}" y2="230" stroke="#3d4b50" stroke-dasharray="4 4"/>')
    for n in range(min(4, len(actors) * 2)):
        a = int(rnd() * len(actors))
        b = (a + 1 + int(rnd() * (len(actors) - 1))) % len(actors)
        y = 60 + n * 40
        parts.append(f'<line x1="{xs[a]}" y1="{y}" x2="{xs[b]}" y2="{y}" stroke="{colors[n % 4]}" stroke-width="2"/>')
        parts.append(f'<polygon points="{xs[b]},{y} {xs[b] - 8},{y - 4} {xs[b] - 8},{y + 4}" fill="{colors[n % 4]}"/>')
    return _wrap(width, height, "".join(parts), caption)


def compose_hex(seed, labels, caption):
    rnd = _rng(seed)
    colors = _palette(rnd)
    parts = []
    width, height = 640, 280
    for r in range(3):
        for c in range(6):
            cx = 70 + c * 96 + (40 if r % 2 else 0)
            cy = 60 + r * 78
            if rnd() > 0.72:
                continue
            pts = []
            rad = 28 + rnd() * 8
            for k in range(6):
                ang = math.radians(60 * k - 30)
                pts.append(f"{cx + math.cos(ang) * rad:.1f},{cy + math.sin(ang) * rad:.1f}")
            parts.append(f'<polygon points="{" ".join(pts)}" fill="#10202b" stroke="{colors[(r + c) % 4]}" stroke-width="2"/>')
    if labels:
        parts.append(f'<text x="20" y="{height - 16}" fill="#f3efe4" font-size="13">{_e(" · ".join(labels[:3])[:70])}</text>')
    return _wrap(width, height, "".join(parts), caption)


COMPOSERS = [
    compose_metro, compose_decision, compose_radial, compose_swim, compose_bars,
    compose_wave, compose_matrix, compose_funnel, compose_gauge, compose_fish,
    compose_ladder, compose_hex,
]


def _path_for(kind, labels, rnd):
    if kind == "call-path":
        xs = [40 + i * 120 for i in range(len(labels))]
        ys = [80 + math.sin(i + rnd() * 2) * 24 for i in range(len(labels))]
        d = "M " + " C ".join(
            f"{xs[i]:.0f} {ys[i]:.0f}, {xs[i] + 40:.0f} {ys[i] - 20:.0f}, {xs[i + 1]:.0f} {ys[i + 1]:.0f}"
            for i in range(len(xs) - 1)
        )
        d = f"M {xs[0]:.0f} {ys[0]:.0f} " + " ".join(
            f"C {xs[i] + 30:.0f} {40 + rnd() * 30:.0f}, {xs[i + 1] - 30:.0f} {140 - rnd() * 20:.0f}, {xs[i + 1]:.0f} {ys[i + 1]:.0f}"
            for i in range(len(xs) - 1)
        )
        return d, xs, ys, 760, 200
    if kind == "event-stream":
        d = f"M 30 40 L 30 160 L {80 + rnd() * 40:.0f} 160"
        xs, ys = [30], [40]
        for i in range(1, len(labels)):
            x = 40 + i * 130
            y = 50 + (i % 3) * 45
            d += f" L {x:.0f} {y:.0f}"
            xs.append(x)
            ys.append(y)
        return d, xs, ys, 760, 220
    if kind == "lambda-roundtrip":
        d = "M 60 110 C 180 30, 280 30, 360 110 C 440 190, 540 190, 660 110"
        if rnd() > 0.5:
            d += " C 560 40, 200 40, 80 110"
        xs = [60, 360, 660][: len(labels)]
        ys = [110, 110, 110][: len(labels)]
        while len(xs) < len(labels):
            xs.append(80 + len(xs) * 140)
            ys.append(70 + (len(ys) % 2) * 70)
        return d, xs, ys, 740, 220
    # routing decision
    d = "M 80 40 L 80 90 L 220 90 L 220 160"
    xs = [80, 220, 420, 580][: len(labels)]
    ys = [40, 90, 160, 90][: len(labels)]
    extra = ""
    for i in range(len(labels) - 1):
        extra += f" L {80 + i * 150:.0f} {40 + (i % 2) * 100:.0f}"
    return "M 40 120 " + extra, [40 + i * 140 for i in range(len(labels))], [120 - (i % 2) * 50 for i in range(len(labels))], 760, 210


def animated_flow(seed, kind, labels, caption):
    rnd = _rng(seed + kind)
    colors = _palette(rnd)
    labels = labels[:6] or ["Start", "Next"]
    d, xs, ys, width, height = _path_for(kind, labels, rnd)
    dur = 2.4 + rnd() * 3.2
    kid = "m" + hashlib.sha256(seed.encode()).hexdigest()[:10]
    parts = [
        f'<path id="{kid}" d="{d}" fill="none" stroke="{colors[0]}" stroke-width="4" stroke-linecap="round"/>',
        f'<circle r="{6 + rnd() * 3:.1f}" fill="{colors[1]}"><animateMotion dur="{dur:.2f}s" repeatCount="indefinite" path="{d}"/></circle>',
    ]
    for i, label in enumerate(labels):
        x = xs[i] if i < len(xs) else 40 + i * 100
        y = ys[i] if i < len(ys) else 40
        parts.append(f'<rect x="{x - 8:.0f}" y="{y + 14:.0f}" width="108" height="26" rx="8" fill="#10202b" stroke="{colors[i % 4]}"/>')
        parts.append(f'<text x="{x + 46:.0f}" y="{y + 32:.0f}" text-anchor="middle" fill="#f3efe4" font-size="11">{_e(label[:16])}</text>')
    parts.append(f'<text x="12" y="{height - 8}" fill="#93a8ad" font-size="11">{_e(kind + " · " + caption[:60])}</text>')
    return _wrap(width, height, "".join(parts), kind + " " + caption)


def chart_svg(title, xlabel, ylabel, series, caption):
    width, height = 720, 320
    left, top, right, bottom = 64, 28, 690, 250
    peak = max(max(vals) for _, vals in series) or 1
    parts = [
        f'<text x="24" y="22" fill="#f3efe4" font-size="16" font-family="Palatino, Georgia, serif">{_e(title)}</text>',
        f'<line x1="{left}" y1="{top}" x2="{left}" y2="{bottom}" stroke="#93a8ad"/>',
        f'<line x1="{left}" y1="{bottom}" x2="{right}" y2="{bottom}" stroke="#93a8ad"/>',
        f'<text x="16" y="150" fill="#93a8ad" font-size="11" transform="rotate(-90 16 150)">{_e(ylabel)}</text>',
        f'<text x="{left}" y="290" fill="#93a8ad" font-size="12">{_e(xlabel)}</text>',
    ]
    colors = ["#e5843b", "#3dcfb4", "#8eb8ff", "#f0c56a"]
    n = max(len(vals) for _, vals in series)
    for s_i, (name, vals) in enumerate(series):
        pts = []
        for i, val in enumerate(vals):
            x = left + (i / max(1, n - 1)) * (right - left)
            y = bottom - (val / peak) * (bottom - top - 10)
            pts.append(f"{x:.1f},{y:.1f}")
        parts.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{colors[s_i % 4]}" stroke-width="3"/>')
        parts.append(f'<text x="{left + 8}" y="{36 + s_i * 16}" fill="{colors[s_i % 4]}" font-size="12">{_e(name)}</text>')
    parts.append(f'<text x="{left}" y="312" fill="#c9d2cf" font-size="12">{_e(caption[:110])}</text>')
    return _wrap(width, height, "".join(parts), title)


def erlang_c(agents, offered):
    if agents <= offered:
        return 1.0
    b = 1.0
    for k in range(1, agents + 1):
        b = (offered * b) / (k + offered * b)
    return min(1.0, b / (1 - (offered / agents) * (1 - b)))


def build_charts():
    minutes = list(range(0, 110, 10))
    customer = [m * 0.038 for m in minutes]
    basic = [m * 0.018 for m in minutes]
    charts = [{
        "id": "price-voice",
        "title": "Voice service versus minutes",
        "svg": chart_svg("Voice service charge", "Minutes", "USD", [("Connect Customer", customer), ("Customer Basic", basic)], "List rates dated 14 Oct 2026. Telephony is extra."),
    }]
    did = [0.03 * d + 0.0022 * 20 for d in range(0, 31, 3)]
    charts.append({"id": "price-did", "title": "US DID daily plus a 20-minute inbound day", "svg": chart_svg("DID carrying cost", "Days sampled", "USD", [("Oregon example", did)], "0.030 USD per day plus 0.0022 USD per inbound minute.")})
    units = [0.038, 0.010, 0.080, 0.014, 0.045, 0.010]
    # bar-like via a one-point series doesn't work well; draw explicit bars
    labels = ["Voice min", "Chat msg", "Email", "SMS msg", "Campaign min", "Web audio"]
    width, height = 720, 300
    peak = max(units)
    parts = ['<text x="20" y="24" fill="#f3efe4" font-size="16">Channel unit prices, Connect Customer</text>']
    for i, (label, val) in enumerate(zip(labels, units)):
        h = 20 + (val / peak) * 180
        x = 40 + i * 110
        parts.append(f'<rect x="{x}" y="{240 - h:.0f}" width="70" height="{h:.0f}" rx="8" fill="#e5843b"/>')
        parts.append(f'<text x="{x + 35}" y="262" text-anchor="middle" fill="#f3efe4" font-size="11">{_e(label)}</text>')
        parts.append(f'<text x="{x + 35}" y="{232 - h:.0f}" text-anchor="middle" fill="#f0c56a" font-size="11">{val:.3f}</text>')
    parts.append('<text x="20" y="290" fill="#93a8ad" font-size="12">USD list price. Voice is per minute. Messages are per message. Dated 14 Oct 2026.</text>')
    charts.append({"id": "price-units", "title": "Channel unit prices", "svg": _wrap(width, height, "".join(parts), "Channel unit prices")})
    offered = 20
    agents = list(range(21, 40))
    sl = []
    for n in agents:
        c = erlang_c(n, offered)
        sl.append(1 - c * math.exp(-(n - offered) * (20 / 240)))
    charts.append({"id": "erlang-sl", "title": "Erlang C service level versus agents", "svg": chart_svg("Service level at 20 Erlangs, 240s AHT, 20s target", "Agents above 20", "Service level", [("SL", sl)], "Teaching curve. Shrinkage is not in this line.")})
    raw = list(range(22, 36))
    roster = [math.ceil(n / 0.7) for n in raw]
    charts.append({"id": "shrink", "title": "Shrinkage lifts the roster", "svg": chart_svg("30 percent shrinkage", "Raw agents", "People to schedule", [("Raw", raw), ("Roster", roster)], "Roster = raw / (1 - shrinkage).")})
    quotas = [("Calls", 10), ("Chats", 500), ("Emails", 1000), ("Tasks", 2500)]
    parts = ['<text x="20" y="28" fill="#f3efe4" font-size="16">Default concurrent quotas, new account</text>']
    for i, (name, val) in enumerate(quotas):
        w = 40 + math.log10(val) * 140
        y = 50 + i * 48
        parts.append(f'<text x="20" y="{y + 18}" fill="#c9d2cf" font-size="14">{name}</text>')
        parts.append(f'<rect x="120" y="{y}" width="{w:.0f}" height="26" rx="8" fill="#3dcfb4"/>')
        parts.append(f'<text x="{128 + w:.0f}" y="{y + 18}" fill="#f3efe4" font-size="14">{val}</text>')
    parts.append('<text x="20" y="270" fill="#93a8ad" font-size="12">Applied quotas can be lower. Large raises can take three weeks.</text>')
    charts.append({"id": "quota-concurrent", "title": "Concurrent quotas", "svg": _wrap(720, 290, "".join(parts), "Concurrent quotas")})
    wait = [5, 12, 20, 35, 50, 80]
    abandon = [0.02, 0.05, 0.09, 0.16, 0.27, 0.41]
    charts.append({"id": "abandon", "title": "Abandon rises with wait", "svg": chart_svg("Illustrative abandon versus wait", "Target seconds", "Abandon share", [("Abandon", abandon)], "A teaching shape, not your center's curve. Measure Queue.Duration.")})
    delay = [0, 15, 30, 45, 60]
    primary = [1, 1, 1, 1, 1]
    overflow = [0, 0, 1, 1, 1]
    charts.append({"id": "delay", "title": "When overflow becomes eligible", "svg": chart_svg("Delay of 30 seconds on overflow", "Contact age, seconds", "Eligible", [("Primary", primary), ("Overflow", overflow)], "Lower priority number is offered first among eligible profiles.")})
    pairs = [("Virginia / Oregon", 1), ("Frankfurt / London", 1), ("Tokyo / Osaka", 20)]
    parts = ['<text x="20" y="28" fill="#f3efe4" font-size="16">Replica delivery note</text>']
    for i, (name, seconds) in enumerate(pairs):
        y = 60 + i * 60
        parts.append(f'<text x="20" y="{y}" fill="#f3efe4" font-size="14">{_e(name)}</text>')
        parts.append(f'<rect x="280" y="{y - 18}" width="{40 + seconds * 16}" height="24" rx="8" fill="#e5843b"/>')
        parts.append(f'<text x="{330 + seconds * 16}" y="{y}" fill="#f0c56a" font-size="14">{seconds}s upper note</text>')
    parts.append('<text x="20" y="270" fill="#93a8ad" font-size="12">Osaka is the published case that can take up to 20 seconds. Other pairs have no such note here.</text>')
    charts.append({"id": "osaka", "title": "Osaka delivery", "svg": _wrap(720, 290, "".join(parts), "Osaka delivery")})
    budgets = [("Sync cap", 8), ("Default block", 3), ("Async wait", 60), ("Sequence cap", 20)]
    parts = ['<text x="20" y="28" fill="#f3efe4" font-size="16">Lambda time budgets</text>']
    for i, (name, sec) in enumerate(budgets):
        y = 56 + i * 48
        parts.append(f'<text x="20" y="{y + 16}" fill="#c9d2cf">{name}</text>')
        parts.append(f'<rect x="180" y="{y}" width="{sec * 8}" height="22" rx="8" fill="#8eb8ff"/>')
        parts.append(f'<text x="{190 + sec * 8}" y="{y + 16}" fill="#f3efe4">{sec}s</text>')
    charts.append({"id": "lambda-budget", "title": "Lambda budgets", "svg": _wrap(720, 280, "".join(parts), "Lambda budgets")})
    chats = [100, 250, 400, 500, 500]
    charts.append({"id": "chat-cap", "title": "Chat concurrency fills with idle sessions", "svg": chart_svg("Idle chats still count", "Hour of the day, index", "Concurrent chats", [("Chats", chats)], "The default ceiling is 500, shared with SMS, WhatsApp, and Apple Messages.")})
    days = list(range(0, 120, 10))
    same = [1 if d <= 90 else 0 for d in days]
    charts.append({"id": "email-thread", "title": "Email thread continuity", "svg": chart_svg("Same thread through day 90", "Age in days", "Same thread", [("Thread", same)], "Day 91 starts a new conversation.")})
    camp = [m * 0.045 for m in minutes]
    charts.append({"id": "campaign-price", "title": "Campaign voice versus ordinary voice", "svg": chart_svg("Per-minute service charge", "Minutes", "USD", [("Ordinary", customer), ("Campaign", camp)], "Connect Customer list rates. Telephony still adds.")})
    profiles = [0, 0.005, 0.010, 0.015, 0.020]
    charts.append({"id": "profiles", "title": "Imported profile daily use", "svg": chart_svg("Profiles with imported data", "Profiles used that day", "USD", [("Daily", profiles)], "Connect-only profiles are 0 USD per daily use in the appendix.")})
    steps = [i * 10 for i in range(11)]
    charts.append({"id": "traffic-split", "title": "Traffic distribution steps", "svg": chart_svg("Percent on the source Region", "Step", "Percent", [("Source", [100 - s for s in steps]), ("Replica", steps)], "Global Resiliency moves in 10 percent steps.")})
    analytics = [50, 120, 200, 280, 300, 300]
    charts.append({"id": "rt-analytics", "title": "Real-time analytics concurrency", "svg": chart_svg("Concurrent calls with real-time analytics", "Interval", "Calls", [("Live", analytics)], "Default quota is 300 concurrent real-time analytics calls.")})
    passmark = [50, 70, 80, 90, 100]
    charts.append({"id": "badge", "title": "Skill Builder badge pass mark", "svg": chart_svg("Knowledge-check scores", "Attempt index", "Percent", [("Score", [62, 74, 80, 88, 91]), ("Pass", [80, 80, 80, 80, 80])], "80 percent issues the Credly badge. It is not an AWS Certification exam.")})
    forecast = [80, 95, 110, 130, 150, 140, 120, 100]
    charts.append({"id": "intraday", "title": "Intraday forecast shape", "svg": chart_svg("Rest-of-day volume, teaching shape", "15-minute bucket", "Contacts", [("Forecast", forecast)], "Native forecasting refreshes this every 15 minutes once you have history.")})
    screen = [m * 0.006 for m in minutes]
    charts.append({"id": "screen", "title": "Screen recording on the Basic list", "svg": chart_svg("Screen recording", "Minutes", "USD", [("Screen", screen)], "0.006 USD per minute on the Basic price list. Voice recording is a separate decision.")})
    acw = [20, 35, 50, 40, 25]
    talk = [180, 200, 220, 190, 170]
    charts.append({"id": "aht-parts", "title": "Talk and ACW are both handle time", "svg": chart_svg("Two clocks inside AHT", "Sample", "Seconds", [("Talk", talk), ("ACW", acw)], "Say which one your report includes. Occupancy needs ACW.")})
    headroom = [8, 20, 40, 60, 80, 95]
    charts.append({"id": "headroom", "title": "Quota headroom", "svg": chart_svg("Usage as a percent of quota", "Week", "Percent", [("Usage", headroom), ("Alarm", [80] * len(headroom))], "Alarm at 80 percent. Ask early. Large raises can take three weeks.")})
    occupancy = [0.62, 0.71, 0.78, 0.84, 0.69]
    charts.append({"id": "occupancy", "title": "Occupancy across a week", "svg": chart_svg("Occupancy, teaching week", "Day", "Occupancy", [("Occupancy", occupancy)], "Handle time plus ACW, divided by time available for work.")})
    cert_hours = [5, 5, 8, 20]
    parts = ['<text x="20" y="28" fill="#f3efe4" font-size="16">Learning time is not an exam</text>']
    names = ["Connect Fundamentals", "AI Fundamentals", "Developer badge", "SAA study, typical"]
    for i, (name, hours) in enumerate(zip(names, cert_hours)):
        y = 56 + i * 48
        parts.append(f'<text x="20" y="{y + 16}" fill="#c9d2cf" font-size="13">{name}</text>')
        parts.append(f'<rect x="280" y="{y}" width="{hours * 16}" height="22" rx="8" fill="#c4b5fd"/>')
        parts.append(f'<text x="{290 + hours * 16}" y="{y + 16}" fill="#f3efe4">{hours}h scale</text>')
    parts.append('<text x="20" y="270" fill="#93a8ad" font-size="12">Badges pass at 80 percent. Solutions Architect - Associate is the exam, not a badge.</text>')
    charts.append({"id": "study-hours", "title": "Badges and the associate exam", "svg": _wrap(720, 290, "".join(parts), "Study paths")})
    return charts


TRY = {
    "foundations": "cert-planner",
    "instance": "saml-mapper",
    "telephony": "call-path",
    "flows": "flow-builder",
    "lex": "lex-mapper",
    "ai": "integration-hooks",
    "lambda": "lambda-sim",
    "routing": "routing-designer",
    "workspace": "webrtc",
    "records": "ctr-inspector",
    "channels": "quota-headroom",
    "analytics": "ctr-inspector",
    "security": "iam-checker",
    "resiliency": "resiliency-drill",
    "troubleshoot": "find-fault",
    "bridge": "translator",
    "integrations": "ecosystem-map",
    "ecosystem": "e911-checker",
}


def fault_records():
    rows = []
    for item in FAULTS:
        fid, symptom, cause, fix, url, source, hop, capture = item
        rows.append({
            "id": fid,
            "symptom": symptom,
            "cause": cause,
            "detail": cause,
            "fix": fix,
            "url": url,
            "source": source,
            "hop": hop,
            "capture": capture,
        })
    return rows


def extra_lessons():
    lessons = []
    for item in FAULTS:
        fid, symptom, cause, fix, url, source, hop, capture = item
        lab = "find-fault"
        if "UDP" in cause or "TURN" in cause or "media" in cause.lower() or "VPN" in cause:
            lab = "webrtc"
        elif "Lambda" in symptom or "lambda" in cause.lower():
            lab = "lambda-sim"
        elif "queue" in symptom.lower() or "priority" in symptom.lower() or "Delay" in fix:
            lab = "routing-designer"
        elif "911" in symptom or "E911" in hop:
            lab = "e911-checker"
        elif "WFM" in hop or "Kinesis" in hop and "agent" in cause.lower():
            lab = "wfm-adherence"
        elif "SAML" in symptom or "security profile" in cause.lower():
            lab = "saml-mapper"
        elif "price" in symptom.lower():
            lab = "pricing"
        lessons.append({
            "id": "fault-" + fid,
            "track": "troubleshoot",
            "title": symptom,
            "why": f"This fault shows up at the {hop.lower()} hop. Naming it stops a team from editing the flow when the failure is elsewhere.",
            "paras": [
                cause + " The capture that settles it is " + capture + ".",
                "Change one thing: " + fix + " Then repeat the same scenario and compare the new ContactId with the old one.",
            ],
            "points": [
                "Hop: " + hop + ".",
                "Cause: " + cause,
                "Fix: " + fix,
                "Capture: " + capture + ".",
            ],
            "mistake": "Changing the flow, the Lambda, and the firewall in the same hour.",
            "number": {"k": "Hop", "v": hop[:12], "n": capture},
            "diagram": {"type": "path", "nodes": [{"id": "0", "label": hop}, {"id": "1", "label": "Capture"}, {"id": "2", "label": "One change"}], "caption": symptom},
            "flow": [
                {"label": "See it", "detail": symptom},
                {"label": "Name the hop", "detail": hop},
                {"label": "Capture", "detail": capture},
                {"label": "Fix", "detail": fix},
            ],
            "cite": {"url": url, "title": source},
            "try": lab,
        })
    return lessons


def _tone(freqs, seconds, rate=8000, volume=0.35):
    samples = []
    for n in range(int(rate * seconds)):
        t = n / rate
        env = min(1.0, n / 80) * min(1.0, (int(rate * seconds) - n) / 80)
        sample = 0
        for freq in freqs:
            sample += math.sin(2 * math.pi * freq * t)
        sample = (sample / max(1, len(freqs))) * volume * env
        samples.append(sample)
    return samples


def _silence(seconds, rate=8000):
    return [0.0] * int(rate * seconds)


def _wav(samples, rate=8000):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(1)
        handle.setframerate(rate)
        frames = bytearray()
        for sample in samples:
            frames.append(int(max(0, min(255, round(128 + sample * 120)))))
        handle.writeframes(frames)
    return b64encode(buf.getvalue()).decode("ascii")


DTMF = {
    "1": (697, 1209), "2": (697, 1336), "3": (697, 1477),
    "4": (770, 1209), "5": (770, 1336), "6": (770, 1477),
    "7": (852, 1209), "8": (852, 1336), "9": (852, 1477),
    "*": (941, 1209), "0": (941, 1336), "#": (941, 1477),
}


def build_audio():
    clips = []
    for digit, freqs in DTMF.items():
        clips.append({
            "id": "dtmf-" + ("star" if digit == "*" else "hash" if digit == "#" else digit),
            "title": "DTMF " + digit,
            "blurb": "A short dual tone for the keypad digit " + digit + ". Generated in this file, not recorded from a network.",
            "b64": _wav(_tone(freqs, 0.28)),
        })
    sequence = []
    for digit in ("1", "2"):
        sequence += _tone(DTMF[digit], 0.22) + _silence(0.12)
    clips.append({"id": "ivr-12", "title": "IVR presses 1 then 2", "blurb": "Two digits the way a menu collects an order-status choice.", "b64": _wav(sequence)})
    clips.append({"id": "ringback", "title": "Ringback teaching tone", "blurb": "440 Hz and 480 Hz, the classic North American ringback pair, as a short example.", "b64": _wav(_tone((440, 480), 0.7))})
    busy = _tone((480, 620), 0.28) + _silence(0.22) + _tone((480, 620), 0.28)
    clips.append({"id": "busy", "title": "Busy cadence", "blurb": "Two short bursts. Campaign fast-busy is a quota symptom, not this tone alone.", "b64": _wav(busy)})
    clips.append({"id": "record-beep", "title": "Recording beep", "blurb": "A 1400 Hz beep you can put in mind next to the recording prompt.", "b64": _wav(_tone((1400,), 0.25, volume=0.4))})
    clips.append({"id": "join", "title": "Agent join", "blurb": "A two-note chime for the moment whisper ends and the agent is connected.", "b64": _wav(_tone((523,), 0.12) + _silence(0.04) + _tone((659,), 0.18))})
    clips.append({"id": "error-tone", "title": "Error branch", "blurb": "A falling pair. Use it when you demonstrate an unconnected error port.", "b64": _wav(_tone((440,), 0.16) + _tone((330,), 0.22))})
    clips.append({"id": "closed", "title": "Out of hours", "blurb": "Three descending notes for the out-of-hours branch.", "b64": _wav(_tone((494,), 0.12) + _tone((392,), 0.12) + _tone((330,), 0.18))})
    clips.append({"id": "callback", "title": "Callback accepted", "blurb": "A rising pair for a callback offer the caller accepted.", "b64": _wav(_tone((392,), 0.1) + _tone((523,), 0.16) + _tone((659,), 0.2))})
    clips.append({"id": "queue-tick", "title": "Queue tick", "blurb": "A soft tick each time a waiting contact ages in a demo.", "b64": _wav(_tone((880,), 0.06, volume=0.25))})
    clips.append({"id": "whisper", "title": "Whisper sting", "blurb": "A short sting for the agent whisper, before the customer is joined.", "b64": _wav(_tone((784, 988), 0.2))})
    clips.append({"id": "disconnect", "title": "Disconnect", "blurb": "A single low tone for the disconnect block.", "b64": _wav(_tone((220,), 0.3))})
    clips.append({"id": "confirm", "title": "933-style double beep", "blurb": "Two beeps standing in for a test readback. This is not a recording of a live test call.", "b64": _wav(_tone((1000,), 0.12) + _silence(0.08) + _tone((1000,), 0.12))})
    hold = []
    for freq in (262, 330, 392, 330):
        hold += _tone((freq,), 0.18, volume=0.22)
    clips.append({"id": "hold", "title": "Hold motif", "blurb": "Four quiet notes. A real hold flow should use a prompt you own.", "b64": _wav(hold)})
    return clips


def compose_sigil(seed, label):
    rnd = _rng("sigil:" + seed)
    colors = _palette(rnd)
    sides = 3 + int(rnd() * 6)
    pts = []
    for k in range(sides):
        ang = -math.pi / 2 + k * math.tau / sides
        rad = 16 + rnd() * 18
        pts.append(f"{48 + math.cos(ang) * rad:.1f},{40 + math.sin(ang) * rad:.1f}")
    rings = int(1 + rnd() * 3)
    body = [f'<polygon points="{" ".join(pts)}" fill="#10202b" stroke="{colors[0]}" stroke-width="2"/>']
    for n in range(rings):
        body.append(f'<circle cx="48" cy="40" r="{6 + n * 7 + rnd() * 3:.1f}" fill="none" stroke="{colors[(n + 1) % 4]}" stroke-width="1.5"/>')
    if rnd() > 0.5:
        body.append(f'<rect x="{20 + rnd() * 10:.0f}" y="{18 + rnd() * 8:.0f}" width="{10 + rnd() * 16:.0f}" height="8" rx="2" fill="{colors[2]}"/>')
    body.append(f'<text x="48" y="78" text-anchor="middle" fill="#f3efe4" font-size="8">{_e(label[:18])}</text>')
    return _wrap(96, 86, "".join(body), label)


def _figure(seed, labels, caption, index):
    labels = list(labels) or ["Step"]
    while len(labels) < 4:
        labels.append(labels[-1] + " " + str(len(labels)))
    composer = COMPOSERS[index % len(COMPOSERS)]
    return composer(seed + ":" + str(index), labels, caption)


def attach(data):
    illustrations = []
    flows = []
    seen = set()

    def keep(svg, bucket, caption, kind):
        salt = 0
        current = svg
        while True:
            digest = hashlib.sha256(current.encode()).hexdigest()
            if digest not in seen:
                seen.add(digest)
                break
            salt += 1
            current = current.replace("<svg ", f'<svg data-salt="{salt}" ', 1)
        item = {"id": kind[:1] + str(len(bucket) + len(illustrations) + len(flows)), "svg": current, "caption": caption, "kind": kind}
        # ids must be unique across both; assign after
        return current, digest

    def add_ill(svg, caption, kind):
        current, _digest = keep(svg, illustrations, caption, kind)
        item = {"id": "fig-%04d" % len(illustrations), "svg": current, "caption": caption, "kind": kind}
        illustrations.append(item)
        return item["id"]

    def add_flow(svg, caption, kind):
        current, _digest = keep(svg, flows, caption, kind)
        item = {"id": "flow-%04d" % len(flows), "svg": current, "caption": caption, "kind": kind}
        flows.append(item)
        return item["id"]

    charts = build_charts()
    for chart in charts:
        chart["figure"] = add_ill(chart["svg"], chart["title"], "chart")

    for lesson_index, lesson in enumerate(data["lessons"]):
        labels = [step["label"] for step in lesson.get("flow", [])] or [lesson["title"]]
        labels = labels + [point.split(":")[0][:18] for point in lesson.get("points", [])]
        lesson.setdefault("try", TRY.get(lesson["track"], "flow-builder"))
        figure_ids = []
        for n in range(10):
            caption = lesson["title"] + " — figure " + str(n + 1)
            seed = lesson["id"] + ":" + str(n) + ":" + lesson["title"]
            figure_ids.append(add_ill(_figure(seed, labels, caption, lesson_index * 3 + n), caption, "lesson"))
        lesson["figures"] = figure_ids
        flow_ids = []
        kinds = ("call-path", "event-stream", "lambda-roundtrip", "routing-decision")
        for n in range(3):
            kind = kinds[(lesson_index + n) % len(kinds)]
            caption = lesson["title"]
            flow_ids.append(add_flow(animated_flow(lesson["id"] + kind + str(n), kind, labels, caption), caption, kind))
        lesson["animated"] = flow_ids
        if lesson["track"] in ("security", "routing", "analytics", "channels"):
            lesson["chart"] = charts[lesson_index % len(charts)]["figure"]

    for fault in data.get("faults", []):
        poster = compose_fish(fault["id"], [fault["hop"], fault["symptom"][:24], "Fix"], fault["symptom"])
        fault["figure"] = add_ill(poster, fault["symptom"], "fault")
        fault["animated"] = add_flow(animated_flow(fault["id"] + "fault", "call-path", [fault["hop"], "Capture", "Fix"], fault["symptom"]), fault["symptom"], "call-path")

    for block_name, _job, group in _blocks():
        add_ill(compose_sigil("block:" + block_name + ":" + group, block_name), block_name, "block")

    for term in data["glossary"]:
        term["mark"] = add_ill(compose_sigil(term["term"] + ":" + term["track"], term["term"]), term["term"], "glossary")

    data["illustrations"] = illustrations
    data["animatedFlows"] = flows
    data["charts"] = [{"id": c["id"], "title": c["title"], "figure": c["figure"]} for c in charts]
    data["audio"] = build_audio()
    return data


def _blocks():
    from tables import BLOCKS
    return BLOCKS
