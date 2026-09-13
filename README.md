# Chatter

Realtime anonymous chat application. Users pick a temporary username, create password-protected rooms, and chat in real time via WebSocket.

## Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, WebSocket (`ws`), PostgreSQL, Redis |
| Frontend | Next.js 15, TypeScript, React, Tailwind CSS |

## Project Structure

```
chatter/
├── server/   # Node.js WebSocket backend
└── web/      # Next.js frontend
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Redis

### Backend

```bash
cd server
cp .env.example .env
# Fill in DATABASE_URL and REDIS_URL in .env

npm install
node index.js
```

The backend runs on **port 3001** by default.

To set up the database schema:
```bash
psql $DATABASE_URL -f schema.sql
```

You can also use Docker Compose to spin up Postgres + Redis locally:
```bash
cd server
docker-compose up -d
```

### Frontend

```bash
cd web
cp .env.example .env.local
# Adjust NEXT_PUBLIC_WS_URL and NEXT_PUBLIC_API_URL if needed

npm install
npm run dev
```

The frontend runs on **port 3000** by default.

## Features

- Anonymous chat — no accounts, just pick a username
- Password-protected rooms
- All rooms visible in the sidebar to every user
- Real-time messaging via WebSocket (single persistent connection)
- Message history loaded on room join
- Unread message indicators per room
- Dark / Light theme + accent color — persisted in localStorage
- Shareable room links (`/rooms/:id`)
- Auto-rejoin rooms on page reload (password cached locally)
- Mobile-friendly sidebar

## Environment Variables

### `server/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |

### `web/.env.local`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_WS_URL` | WebSocket URL of the backend (e.g. `ws://localhost:3001`) |
| `NEXT_PUBLIC_API_URL` | HTTP URL of the backend (e.g. `http://localhost:3001`) |
