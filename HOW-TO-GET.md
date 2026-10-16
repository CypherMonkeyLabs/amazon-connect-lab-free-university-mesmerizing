# How to get a copy

The study site is static. Open the repository root over HTTP so the guide module can load.

- Browse the repository root on GitHub Pages. `index.html` is the front door.
- Or clone it and serve the root:

```bash
node scripts/gzip-static.mjs
```

Open `http://127.0.0.1:8742/`. Rebuild with `python3 scripts/build_site.py` if you change a lesson. The offline bundle is `downloads/amazon-connect-lab-bundle.zip`.

The first visit caches the shell (page, styles, app, Three.js). Lesson JSON is fetched when you open a track and kept by the service worker, so a later visit works offline. Search, labs, quiz progress, and the theme stay in `localStorage`. Nothing in the campus phones home.
