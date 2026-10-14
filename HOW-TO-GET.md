# How to get a copy

The campus is a static site. Open it over HTTP so the modules can load.

- Browse `campus/` on GitHub Pages once this folder is published. The repository root redirects there.
- Download `releases/amazon-connect-lab.zip`, unzip it, and serve the `campus` folder:

```bash
python3 -m http.server 43123 --directory campus
```

- Clone the repository and run `python3 scripts/build_campus.py` if you change a lesson.

The first visit caches the shell (page, styles, app, Three.js). Lesson JSON is fetched when you open a track and kept by the service worker, so a later visit works offline. Search, labs, quiz progress, and the theme stay in `localStorage`. Nothing in the campus phones home.
