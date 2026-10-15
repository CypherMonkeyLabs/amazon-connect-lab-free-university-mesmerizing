# Amazon Connect Lab

![Amazon Connect Lab home, night-ops theme, flat topology until the map opens](docs/screenshots/home.png)

Night ops, light, futuristic, gaming, neon, high contrast, and the console theme:

![Night ops](docs/screenshots/theme-dark.png)
![Day shift](docs/screenshots/theme-light.png)
![High contrast](docs/screenshots/theme-contrast.png)
![Console](docs/screenshots/theme-console.png)

Free offline campus for Amazon Connect: 18 tracks, 129 lessons, 24 browser labs, 1,590 illustrations, and 427 animated flows. One entry page. No CDN. No AWS account.

**Topics:** `amazon-connect` `aws` `contact-center` `telephony` `education` `offline` `interactive-learning` `github-pages`

Serve the `campus` folder over HTTP. `file://` cannot load the modules.

```bash
python3 scripts/build_campus.py
python3 -m http.server 43123 --directory campus
```

Then open `http://127.0.0.1:43123/`. The repository root `index.html` redirects to `campus/`. GitHub Pages should publish the `campus` directory (`.nojekyll` is already there). After the first visit, the service worker caches the shell and fills the rest of the curriculum in the background, so a later visit works offline.

## What changed from the single-file build

| | Before | After |
| --- | --- | --- |
| Entry | The same 4,906,039-byte HTML copied at the repo root, `campus/index.html`, and `campus/amazon-connect-lab.html` | One shell, `campus/index.html` (about 6 KB). Curriculum is per-track JSON fetched on demand. |
| First load | ~4.9 MB parsed up front | 202,646 bytes (shell, CSS, app, flow language, shell JSON). Three.js r170 loads with the map, which brings that view to 933,413 bytes |
| DOM | ~592 nodes, the whole campus mounted at once | One view at a time, measured under 400 nodes on home, lessons, labs, and studios |
| Heading | No `h1` | One `h1` per view |
| 3D | A single 2D canvas | WebGL architecture map on `#/map` (Connect, Lex, Lambda, Kinesis, Contact Lens, CCP) with orbit controls and failure scenarios. The home page stays a flat SVG and does not import Three.js. Reduced motion keeps the map flat too |
| Mobile | One 980px breakpoint | Slide-out track drawer under 980px, bottom nav under 640px |
| Lighthouse 12.8.2, mobile, headless Chrome 154 | Not scored on the single-file page. An earlier pass that parsed Three.js on the home page scored performance 84 with 590 ms total blocking time | Performance **99**, accessibility **100**. Total blocking time **0 ms**. FCP 1.5 s, LCP 2.0 s, CLS 0.029 |

A later route check in the same browser stayed on one `h1` and under 400 nodes: home 359, a foundations lesson 321, the flow builder 308, Erlang 233, the CCP 240, Contact Lens 234, the 3D map 289. Python's `http.server` does not gzip. GitHub Pages does, so the text-compression warning in this local run is the server, not the campus.

## Studios and labs

Twenty-four labs still run in the browser, including the contact-flow builder, call path, routing designer, Lambda invoke, CTR inspector, Erlang C calculator, pricing estimator (14 October 2026 Oregon DID rates), IAM checker, and fault finder.

Connect-specific studios:

- **Flow builder** imports and exports Amazon Connect flow-language JSON, version `2019-10-30`, and checks actions against the public flow-language reference.
- **3D map** (`#/map`) orbits the instance topology and toggles Lambda, Kinesis, Lex, turn, and Contact Lens failures.
- **CCP softphone** (`#/ccp`) rings with a local 440 Hz + 480 Hz tone, answers, tracks talk time and sentiment, and saves a wrap-up. It does not open a WebRTC peer.
- **Contact Lens playback** (`#/lens`) scrubs a scripted transcript, category tags, and card-number redaction.
- **Erlang C** plots live wait probability and service level as agents and shrinkage change.
- **CDK / CloudFormation** sits on a tab in every lesson, one snippet set per track.

## Settings and tips

Settings (`#/settings`) store the theme, sound effects, narration, reduced motion, and type size in `localStorage` under `acl-campus-v1`, with the streak and quiz progress. Themes are Night ops, Light, Futuristic, Gaming, Neon, High contrast, and Console. Narration waits for `voiceschanged`, prefers a natural or high-quality voice, and does not select Microsoft Edge unless you pick that voice. Speed runs from 0.6× to 1.6×.

Cheat codes (`#/cheats`) are one-page HTML, PDF, and PNG sheets for ports, call flows, cutover, the firewall matrix, careers, and the 2026 timeline, plus `downloads/flashcards.json` and `downloads/amazon-connect-lab.zip`. The studio bar links the CypherMonkey Labs home, Linktree, this repository, dev.to, Hugging Face, and X. The footer links the contact form for work and for a takedown. No email address is shown.

Tips (`#/tips`) is one cheat sheet per track: pro tips, interview traps, and a short table. The same sheet is the Tips tab on every lesson. Counts match the single-file campus on `main` with a delta of zero: 1,590 illustrations, 427 animated flows, 25 audio clips, 24 labs, 927 quiz items, and 927 cards.

Progress, theme, and streak stay in `localStorage` under `acl-campus-v1`.

## What is inside

Eighteen tracks and 129 lessons, from the AWS services Connect sits on through the ecosystem around it.

- Foundations: IAM, Regions, Lambda, S3, Kinesis, CloudWatch, networking, certifications, and a dated feature timeline.
- Instance, telephony, contact flows, Lex V2, agent assist, Lambda, routing, the CCP, profiles, cases, tasks, channels, analytics, security, quotas, pricing, and Global Resiliency.
- Troubleshooting, with one-fault drills.
- Bridge: CUCM, UCCX, UCCE, Webex Contact Center, Genesys, and Avaya.
- Integrations: Salesforce, ServiceNow, Microsoft Teams, and a PBX kept beside Connect.
- Ecosystem: glossary, mind map, native and third-party WFM, recording and quality, conversational analytics, US E911 for CCP agents, CRM faults, AI configuration, integration maps, and future hooks.

Shared campus tokens (`--cc-bg`, `--cc-surface`, `--cc-accent-1` through `--cc-accent-4`) are the night-ops palette: ink on `#0b1120`, amber, mint, indigo, and rose. Day shift, high contrast, and the console orange-on-navy theme use the same tokens.

## Rebuild

```bash
python3 scripts/build_campus.py
python3 scripts/og_card.py
python3 scripts/verify_campus.py
```

`verify_campus.py` checks the track, lesson, lab, quiz, card, scenario, glossary, illustration, animated-flow, chart, audio, and fault floors. It requires every lesson to carry figures, an animated flow, a Try it lab, and an IaC tab. It rejects duplicate artwork, external scripts, and a second `h1`. It also round-trips a sample flow and the official flow-language example.

`releases/amazon-connect-lab.zip` is the `campus` folder (about 921 KB compressed). Unzip it and serve that directory. Do not open `index.html` as a file URL.

## Sources

Each lesson ends with the page the facts came from. The Sources view lists them. Prices are list prices from the public appendix as read for this campus on 14 October 2026. They are estimates, not invoices. Voice ID support ended on 20 May 2026. The admin guide renamed several features on 4 August 2026: Contact Lens is conversational analytics, Amazon Q in Connect is agent assist, and Voice+ is Live Sync. The AWS Certification catalog has no Amazon Connect specialty exam. Connect-specific recognition on Skill Builder is a badge, passed at 80 percent.

Three.js r170 and its OrbitControls example are vendored under `web/vendor` and `campus/vendor` under the MIT license. See `NOTICE.md`.

## License

Code and original study text are released under the MIT license. AWS names, marks, and documentation remain with Amazon Web Services.
