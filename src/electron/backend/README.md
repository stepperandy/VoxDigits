# VoxVPN Local Backend

Simple Express server with JSON file storage. No Supabase, no cloud, no RLS.

## Setup

```bash
cd electron/backend
npm install
npm start
```

Server runs at **http://localhost:5000**

## Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | /register | `{ email, password }` | Create account, returns token |
| POST | /login | `{ email, password }` | Sign in, returns token |
| GET | /servers | — | Returns list of 20 VPN servers |
| POST | /check-access | `{ user_email }` | Check if user has VPN access |
| POST | /connect | `{ user_email, server_id }` | Connect to a server |
| POST | /disconnect | `{ user_email }` | Disconnect |

## Data storage

All users and sessions are stored in `db.json` next to `server.js`.  
Delete `db.json` to reset all accounts.

## Upgrading later

Replace `readDB()` / `writeDB()` calls with your real database (PostgreSQL, SQLite, etc.)  
without touching any routes.