# RackTrack (rack-database)

Static PWA — rack inventory tracker. Plain HTML + Bootstrap 5 + DataTables + Chart.js, no build step.

## Run with Docker

```bash
docker compose up -d --build
# site at http://localhost:8080
```

## Run without Docker (dev preview)

```bash
python3 -m http.server 8080
# site at http://localhost:8080
```

## Files

- `index.html` — entire app (single file)
- `manifest.json` — PWA manifest
- `sw.js` — service worker

## Deploy

Pushes to `main` auto-deploy to GitHub Pages:
https://ajiqnomoto.github.io/rack-database/
