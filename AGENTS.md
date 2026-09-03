# Base44 Dev Environment

## What this is
A Base44-generated Vite + React frontend (single service) that talks to the
Base44 cloud backend. There is no local backend/database — all data and auth
live on the Base44 platform.

## Running
```
docker compose -f docker-compose.base44.yml up -d --build
```
- Web entry point is on host port **3000** (container Vite port 5173).
- `npm install` runs at container start, then `npm run dev -- --host 0.0.0.0`.
- Source is bind-mounted at `/app`; `node_modules` is an anonymous volume so
  the host's lack of Node doesn't interfere.
- File-watch polling (`CHOKIDAR_USEPOLLING=true`) is enabled for bind mounts.

## Required env vars (not secrets)
- `VITE_BASE44_APP_ID` — app id, already in `base44/.app.jsonc` and set in
  `.env.base44-defaults`.
- `VITE_BASE44_APP_BASE_URL` — the Base44-hosted backend URL
  (`https://ink-crafted-stories.base44.app`), set in `.env.base44-defaults`.
Both are public values (not credentials) and are read at dev-server start.
Override either via `/run/base44/app.env` if needed.

## Vite server config
`vite.config.js` sets `server.host: true` and `server.allowedHosts: true` so the
preview's external hostname is accepted (Vite blocks unknown hosts by default).

## No external secrets at boot
The app uses `requiresAuth: false`; auth tokens come from URL params / localStorage.
Connectors (Gmail, Google Analytics, Search Console, Calendar) are configured on
the Base44 platform side, not via env vars in this repo.

## Verify
`curl -sf -H "Host: external-preview.example.com" http://localhost:3000/` should
return the app HTML. The preview iframe loads the same origin.
