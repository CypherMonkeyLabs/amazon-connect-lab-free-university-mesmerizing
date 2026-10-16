"""Shared chrome: brand buttons, favicon tags, copyright, and the author line.

The three buttons are the only brand links: the lab site, the GitHub org, and Linktree.
No email, X, LinkedIn, Hugging Face, or a personal GitHub profile.
"""

COPYRIGHT = "© 2026 CypherMonkeyLabs 🐒"
IDENTITY = (
    "Lucky is a lifelong student and an AI enthusiast, from systems, networking, "
    "voice, and the contact center, growing into AI omni-channel agents."
)
ORG_REPO = "https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing"
ORG = "https://github.com/CypherMonkeyLabs"
HOME = "https://cyphermonkeylabs.com"
LINKTREE = "https://linktr.ee/cypherMonkey"

GITHUB_SVG = (
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">'
    '<path fill="currentColor" d="M12 .5A11.5 11.5 0 0 0 .5 12.4c0 5.26 3.4 9.72 8.12 11.3.6.12.82-.26.82-.58v-2.02c-3.3.74-4-1.6-4-1.6-.54-1.4-1.32-1.78-1.32-1.78-1.08-.76.08-.74.08-.74 1.2.08 1.84 1.26 1.84 1.26 1.06 1.86 2.8 1.32 3.48 1.02.1-.78.42-1.32.76-1.62-2.64-.3-5.42-1.36-5.42-6.04 0-1.34.46-2.42 1.24-3.28-.12-.3-.54-1.54.12-3.2 0 0 1-.34 3.3 1.24a11.2 11.2 0 0 1 6 0c2.28-1.58 3.28-1.24 3.28-1.24.66 1.66.24 2.9.12 3.2.78.86 1.24 1.94 1.24 3.28 0 4.7-2.78 5.74-5.44 6.04.44.38.82 1.12.82 2.26v3.34c0 .32.22.7.82.58A11.5 11.5 0 0 0 23.5 12.4 11.5 11.5 0 0 0 12 .5z"/>'
    "</svg>"
)
GLOBE_SVG = (
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">'
    '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>'
    '<ellipse cx="12" cy="12" rx="4.2" ry="9" fill="none" stroke="currentColor" stroke-width="1.6"/>'
    '<path d="M3.5 12h17M5 7.5h14M5 16.5h14" fill="none" stroke="currentColor" stroke-width="1.4"/>'
    "</svg>"
)
TREE_SVG = (
    '<svg viewBox="0 0 64 64" width="20" height="20" aria-hidden="true">'
    '<circle cx="32" cy="11" r="7" fill="currentColor"/>'
    '<path d="M32 18 V27" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>'
    '<path d="M13 36 C22 25 42 25 51 36" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>'
    '<circle cx="13" cy="38" r="7" fill="currentColor"/>'
    '<circle cx="51" cy="38" r="7" fill="currentColor"/>'
    '<circle cx="32" cy="28" r="5.5" fill="currentColor"/>'
    '<path d="M32 33 V49" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>'
    '<path d="M19 55 H45" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>'
    "</svg>"
)


def _link(href, label, icon):
    return (
        f'<a class="brand-link" href="{href}" target="_blank" rel="noopener noreferrer">'
        f"{icon}<span>{label}</span></a>"
    )


def brand_nav():
    links = [
        _link(HOME, "Visit Cypher Monkey Labs", GLOBE_SVG),
        _link(ORG, "Visit the Labs org", GITHUB_SVG),
        _link(LINKTREE, "Linktree", TREE_SVG),
    ]
    return '<nav class="brand-links" aria-label="CypherMonkey Labs">' + "".join(links) + "</nav>"


def favicon_links(prefix=""):
    return (
        f'<link rel="icon" href="{prefix}favicon.ico" sizes="any">\n'
        f'<link rel="icon" href="{prefix}favicon.svg" type="image/svg+xml">'
    )


def _icon(path):
    return (
        '<svg class="menu-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">'
        f'<path d="{path}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
        "</svg>"
    )


_ICONS = {
    "learn": "M4 19.5V6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 1 4 17.5",
    "diagrams": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    "flows": "M4 7h10M14 7l3-3M17 4v6M20 17H10M10 17l-3 3M7 20v-6",
    "charts": "M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3",
    "cheats": "M7 3h7l5 5v13H7zM14 3v5h5M9 13h6M9 17h6",
    "play": "M8 5v14l12-7z",
    "ecosystem": "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
    "downloads": "M12 4v10M8 10l4 4 4-4M5 19h14",
    "careers": "M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12zM5 20a7 7 0 0 1 14 0",
    "settings": "M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zM4 12h2M18 12h2M12 4v2M12 18v2",
    "labs": "M9 3h6M10 3v6L5 19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l-5-10V3",
    "quiz": "M8 9a4 4 0 1 1 6.5 3c-1 .7-1.5 1.2-1.5 2.2M12 18h.01",
    "cards": "M4 7h12a2 2 0 0 1 2 2v9H6a2 2 0 0 1-2-2zM8 7V5a2 2 0 0 1 2-2h10v12",
    "glossary": "M5 4h6a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3zM19 4h-6a3 3 0 0 0-3 3v13h6a3 3 0 0 1 3 3z",
    "map": "M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zM12 10.5a1.5 1.5 0 1 0-1.5-1.5 1.5 1.5 0 0 0 1.5 1.5z",
    "listen": "M4 10v4h3l4 3V7L7 10zM16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10",
    "timeline": "M12 7v5l3 2M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9z",
    "menu": "M4 7h16M4 12h16M4 17h16",
    "guide": "M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4.2 2.6 5.3.7.6 1.4 1.3 1.4 2.2V19h6v-1.5c0-.9.7-1.6 1.4-2.2C17.7 14.2 19 12.5 19 10a7 7 0 0 0-7-7zM9 21h6",
}


def menu_link(href, key, label, blurb, icon):
    return (
        f'<a href="{href}" data-menu="{key}">'
        f"{_icon(_ICONS[icon])}"
        f'<span class="menu-copy"><strong>{label}</strong><small>{blurb}</small></span>'
        "</a>"
    )


_CAMPUS = [
    ("#/diagrams", "diagrams", "Diagrams", "Large architecture pictures", "diagrams"),
    ("#/flows", "flows", "Flows", "Animated hop diagrams", "flows"),
    ("#/charts", "charts", "Charts", "Prices, quotas, and staffing", "charts"),
    ("#/cheats", "cheats", "Cheat Codes", "One-page downloadable sheets", "cheats"),
    ("#/play", "play", "Play", "Ports game and the daily question", "play"),
    ("#/track/ecosystem", "ecosystem", "Ecosystem", "WFM, recording, E911, and CRM", "ecosystem"),
    ("#/downloads", "downloads", "Downloads", "HTML, PDF, and PNG sheets", "downloads"),
    ("#/career", "careers", "Careers", "Roles and interview prompts", "careers"),
    ("#/settings", "settings", "Settings", "Theme, motion, and type size", "settings"),
]

_PHONE = [
    ("#/", "learn", "Learn", "Tracks and lessons", "learn"),
    *_CAMPUS[:6],
    ("#/downloads", "downloads", "Downloads", "HTML, PDF, and PNG sheets", "downloads"),
    ("#/career", "careers", "Careers", "Roles and interview prompts", "careers"),
    ("#/labs", "labs", "Labs", "Browser labs, no AWS account", "labs"),
    ("#/quiz", "quiz", "Quiz", "Cited questions from the glossary", "quiz"),
    ("#/cards", "cards", "Cards", "Flip a term and its meaning", "cards"),
    ("#/glossary", "glossary", "Glossary", "One meaning per word", "glossary"),
    ("#/map", "map", "Map", "Orbit the instance topology", "map"),
    ("#/audio", "listen", "Listen", "Offline tones and architect clips", "listen"),
    ("#/timeline", "timeline", "Timeline", "Dated feature changes", "timeline"),
    ("#/settings", "settings", "Settings", "Theme, motion, and type size", "settings"),
]


def campus_links():
    return "".join(menu_link(*row) for row in _CAMPUS)


def phone_links():
    return "".join(menu_link(*row) for row in _PHONE)


def bottom_links():
    rows = [
        ("#/", "learn", "Learn", "learn"),
        ("#/diagrams", "diagrams", "Diagrams", "diagrams"),
        ("#/play", "play", "Play", "play"),
    ]
    links = []
    for href, quick, label, icon in rows:
        links.append(
            f'<a href="{href}" data-quick="{quick}">{_icon(_ICONS[icon])}<span>{label}</span></a>'
        )
    links.append(
        f'<button type="button" id="quick-menu" aria-expanded="false" aria-controls="phone-sheet">'
        f'{_icon(_ICONS["menu"])}<span>Menu</span></button>'
    )
    links.append(
        f'<a href="#/audio" data-quick="listen">{_icon(_ICONS["listen"])}<span>Listen</span></a>'
    )
    return "".join(links)


def guide_icon():
    return _icon(_ICONS["guide"])
