# zenntechinc/cli

Official ZENNTECHINC CLI for creating backend projects.

## Install Globally

```bash
npm i -g zenntechinc-cli
```

## Create a New Project

```bash
zenntechinc new project-name
```

Optional:

```bash
zenntechinc new project-name --skip-install
```

Then install dependencies and build:

```bash
cd project-name
npm install
npm run build
```

Before running `npm run dev`, make sure MongoDB is running (or set `MONGODB_URI` in `.env` to a reachable database).
Quick local Docker option from the generated project folder:

```bash
docker compose up -d mongo
```

## Generated Backend Stack

Each generated backend project includes:

- Node.js + TypeScript
- Express.js API
- Socket.IO realtime support
- MongoDB + Mongoose
- JWT auth + bcrypt password hashing
- Optional Redis caching
- Jest + Supertest tests
- ESLint + Prettier setup
- Docker Compose (`api`, `mongo`, `redis`)

Template source: `templates/backend`

## Local CLI Usage (This Repo)

```bash
node ./bin/zenntechinc.js new project-name
```

## Maintainer Verification

Run this when updating the backend template:

```bash
cd templates/backend
npm install
npm run build
npm test
```

## Runtime Notes

- MongoDB is required for app startup.
- Redis is optional (default in template: `REDIS_ENABLED=false`).
- Socket server runs on the same host/port as the API.
