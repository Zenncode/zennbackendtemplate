# ZENNTECHINC Backend Template

Backend template using Express.js with MongoDB-based admin authentication and Redis caching.

## Included Stack

- Runtime: Node.js (>=18.18) + TypeScript
- Web framework: Express.js
- Realtime: Socket.IO (WebSocket + fallback transports)
- Database: MongoDB + Mongoose ODM
- Authentication: JWT (`jsonwebtoken`) + password hashing (`bcryptjs`)
- Caching: Redis (`redis`) optional, toggle via `REDIS_ENABLED`
- Testing: Jest + Supertest
- Code quality: ESLint + Prettier
- Dev tooling: Nodemon + ts-node
- Containerization: Docker Compose (`api`, `mongo`, `redis`)

## Quick Start

```bash
# Option A: local MongoDB service
# mongod
# Option B: Docker Mongo only
# docker compose up -d mongo

npm install
npm run dev
```

Default environment values are in `.env.example`.
`npm run dev` uses `nodemon`, so you will see `[nodemon]` logs and auto-restart on file changes.
Development starts from `app/server.ts`, and production runs from `dist/server.js`.
Redis is optional and disabled by default (`REDIS_ENABLED=false`).
MongoDB is required for startup.

## MongoDB Required

The app connects using `MONGODB_URI` from `.env`.

Default value:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/zenntechinc
```

If you hit this error:

```txt
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

it means no MongoDB instance is reachable at that address.

Fix options:

- Start local MongoDB (`mongod`)
- Run MongoDB container from the project folder: `docker compose up -d mongo`
- Use MongoDB Atlas and replace `MONGODB_URI` in `.env`

## Socket.IO

Socket server runs on the same API host/port.

- Default path: `/socket.io`
- Optional env: `SOCKET_PATH` (example: `/realtime`)
- Optional env: `SOCKET_CORS_ORIGIN` (fallbacks to `CORS_ORIGIN` when not set)

Basic events included in template:

- `socket:welcome` (sent on connect)
- `ping` -> returns `pong`
- `join:room`
- `leave:room`
- `broadcast:room`

Quick client example:

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  path: '/socket.io',
  withCredentials: true,
});

socket.on('socket:welcome', (payload) => {
  console.log(payload);
});

socket.emit('ping', { hello: 'world' }, (response: unknown) => {
  console.log(response);
});
```

## Redis Setup

Use `.env` to configure Redis per environment:

```env
REDIS_ENABLED=false
REDIS_URL=redis://127.0.0.1:6379
REDIS_CONNECT_TIMEOUT_MS=2000
REDIS_CACHE_TTL_SECONDS=30
REDIS_HEALTH_TTL_SECONDS=15
```

Notes:

- For local Redis, keep `REDIS_URL=redis://127.0.0.1:6379`
- For Docker Compose service-to-service networking, use `REDIS_URL=redis://redis:6379`
- To run without Redis, set `REDIS_ENABLED=false` (app continues without cache)

## Port Conflict Handling

If your configured `PORT` (default: `3000`) is already in use, the server can auto-try next ports.

```env
PORT=3000
PORT_AUTO_FALLBACK=true
PORT_FALLBACK_ATTEMPTS=10
```

Example behavior:

- If `3000` is busy, app tries `3001`, `3002`, ... up to configured attempts
- Startup log shows which port is used

## Health Check

```http
GET /
GET /api/health
```

`GET /api/health` uses Redis caching. The payload is cached using `REDIS_HEALTH_TTL_SECONDS` (default: 15 seconds).

Example response:

```json
{
  "status": "ok",
  "generatedAt": "2026-04-20T06:10:00.000Z"
}
```

## Docker Services

`docker-compose.yml` includes:

- `api` (Node/Express app)
- `mongo` (MongoDB 7)
- `redis` (Redis 7)

Run all services:

```bash
docker compose up --build
```

Notes:

- The `api` service uses `MONGODB_URI=mongodb://mongo:27017/zenntechinc` inside Docker network
- For non-Docker local development, keep `.env` as `mongodb://127.0.0.1:27017/zenntechinc`

Quick cache check:

```bash
curl http://localhost:3000/api/health
sleep 2
curl http://localhost:3000/api/health
```

If Redis cache is active, `generatedAt` should stay the same within the health TTL window.

## Admin Login

Endpoint:

```http
POST /api/auth/admin/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Success response:

```json
{
  "accessToken": "<jwt-token>",
  "refreshToken": "<refresh-token>",
  "admin": {
    "id": "<admin-id>",
    "email": "admin@example.com"
  }
}
```

## Refresh Session

Endpoint:

```http
POST /api/auth/admin/refresh
Content-Type: application/json
```

Request body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

## Logout

Endpoint:

```http
POST /api/auth/admin/logout
Authorization: Bearer <access-token>
```

## First Admin Seed

On startup, the app checks `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
If they are set and the admin email does not exist yet, it automatically creates the first admin account.

## Admin-Protected Example

Protected endpoint:

```http
GET /api/admin/me
Authorization: Bearer <jwt-token>
```
