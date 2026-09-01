# Base44 Dev Environment

## Overview
This is a Base44 app (VoxTelefony) — a Vite + React frontend that connects to a Base44-hosted backend via the `@base44/sdk` and `@base44/vite-plugin`. The backend is managed by Base44; only the frontend runs locally.

## Running the app
```
docker compose -f docker-compose.base44.yml up -d
```
- Vite dev server runs on port 5173 inside the container, mapped to host port 3000.
- Source is bind-mounted; live reload is active.
- `npm install` runs automatically on container start.

## Required secrets (delivered via /run/base44/app.env)
- `VITE_BASE44_APP_ID` — Base44 app ID (found in Base44 Builder or .env.local)
- `VITE_BASE44_APP_BASE_URL` — Base44 backend URL (e.g. https://my-app-xxxx.base44.app)

These are also in `.env.base44-defaults` as placeholders so the app boots without credentials; real values override via `env_file` ordering.

## Notes
- `vite.config.js` has `server.host: true` and `allowedHosts: true` to accept the preview's external hostname.
- The `@base44/vite-plugin` proxies `/api` requests to the Base44 backend URL automatically.
- No local database or backend services are needed — all data comes from the Base44 cloud.
