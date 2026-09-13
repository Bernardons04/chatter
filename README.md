# Chatter

## Overview

Chatter is a minimalist, realtime anonymous chat application built as a hands-on portfolio project focused on realtime communication using WebSockets.

The primary goal of this project is to implement robust connection and room management, with PostgreSQL as the primary data store and Redis as a caching layer for a Node.js WebSocket backend.

Users can choose a temporary username, create or join password-protected rooms, and converse in real time. The application is currently deployed at:
[https://chatter-room.vercel.app](https://chatter-room.vercel.app)

## Screenshot

![Chatter Desktop Interface](docs/screenshot.png)

## Features

- **Anonymous chat:** No accounts required, just pick a username
- **Password-protected rooms:** Secure spaces for conversations
- **Real-time messaging via WebSocket:** Messages are delivered to connected clients in real time
- **Single persistent WebSocket connection:** Efficient and robust connection management
- **Multiple rooms:** All rooms visible in the sidebar to every user
- **Message history:** Instantly loaded on room join
- **Redis caching:** Fast message retrieval and performance optimization
- **Unread message indicators:** Per room notifications
- **Shareable room links:** Direct access via `/rooms/:id`
- **Local username/preferences:** Persisted in the browser
- **Dark/light theme + accent colors:** Persisted in `localStorage`
- **Responsive mobile experience:** Dedicated mobile layout and navigation
- **Automatic room entry:** Instantly join rooms upon creation

## Architecture

```text
Client
  ↓
WebSocket Handler
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

### Connection Management
The `RoomManager` handles all active WebSocket connections on the backend. It tracks which WebSocket connections are subscribed to each room, ensuring messages are broadcast only to clients currently joined to that room.

### Caching Strategy
- **PostgreSQL** is the source of truth for all rooms and messages.
- **Redis** is utilized as a cache for message history to reduce database load.
- On a **cache miss**, the message history is fetched from PostgreSQL and immediately stored in Redis.
- New messages are persisted first in PostgreSQL and subsequently update the cache.
- Redis is treated as an optional caching layer; if it becomes unavailable, the system gracefully falls back to querying PostgreSQL directly, ensuring continuous operation.

## Stack

| Layer | Tech | Version |
|---|---|---|
| **Frontend** | Next.js | 16.3.5 |
| | React | 19.2.8 |
| | TypeScript | 5.x |
| | Tailwind CSS | 4.x |
| **Backend** | Node.js | 20+ |
| | WebSocket (`ws`) | 8.21.3 |
| | PostgreSQL (`pg`) | 8.23.0 |
| | Redis (`redis`) | 6.2.1 |
| **Infrastructure**| Docker / Compose | - |
| **Deployment** | Vercel (Frontend), Render (Backend), Neon (DB), Upstash (Cache) | - |

## Project Structure

```
chatter/
├── server/       # Node.js WebSocket backend
│   ├── repositories/
│   ├── services/
│   └── websocket/
└── web/          # Next.js frontend
    ├── public/
    └── src/
```

## Local Development

You can run the backend infrastructure (PostgreSQL and Redis) locally using Docker Compose, meaning you don't need to install them directly on your machine.

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for local DB/Cache)

### Backend

1. Start the database and cache using Docker:
```bash
cd server
docker compose up -d
```

2. Configure environment variables:
```bash
cp .env.example .env
```
*(Ensure `DATABASE_URL` and `REDIS_URL` point to the local Docker instances, e.g., `postgresql://chatter:chatter@localhost:5432/chatter` and `redis://localhost:6379`)*

3. Set up the schema, install dependencies, and start:
```bash
psql $DATABASE_URL -f schema.sql
npm install
npm run dev
```
The backend runs on **port 3001** by default.

### Frontend

1. Configure environment variables:
```bash
cd web
cp .env.example .env.local
```

2. Install dependencies and start:
```bash
npm install
npm run dev
```
The frontend runs on **port 3000** by default.

## Environment Variables

### `server/.env`
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://chatter:chatter@localhost:5432/chatter` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |

### `web/.env.local`
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_WS_URL` | WebSocket URL of the backend | `ws://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | HTTP URL of the backend | `http://localhost:3001` |

## Deployment

The application utilizes a decoupled deployment architecture:

- **Frontend (Vercel):** Hosts the Next.js application, accessible at [https://chatter-room.vercel.app](https://chatter-room.vercel.app).
- **Backend (Render):** Hosts the Node.js WebSocket server, running securely over `wss://`.
- **Database (Neon):** Managed PostgreSQL database.
- **Cache (Upstash):** Managed Redis instance.

## License

This project is licensed under the MIT License.
