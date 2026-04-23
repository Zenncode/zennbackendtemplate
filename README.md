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

## Run the Generated Backend (Step-by-Step)

1. Start backend in development:
```bash
npm run dev
```

2. Verify it is working:

```bash
curl http://localhost:3000/
curl http://localhost:3000/api/health
```

3. Optional MongoDB setup (only needed when your feature requires DB persistence):

Quick local Docker option:

```bash
docker compose up -d mongo
```

MongoDB Atlas option (cloud):

1. Create an Atlas project and cluster (M0/free is fine for development).
2. Create a database user (username/password).
3. Add your IP in Network Access (for dev, you can temporarily allow `0.0.0.0/0`).
4. In Atlas, open Connect -> Drivers and copy the connection string.
5. Put the connection string in `.env` as `MONGODB_URI`, for example:

```env
MONGODB_URI=mongodb+srv://<db-user>:<db-password>@<cluster-url>/zenntechinc?retryWrites=true&w=majority
```

If your database password has special characters, URL-encode it.

Note:
- The generated server attempts MongoDB connection on startup.
- If MongoDB is unavailable and `MONGODB_REQUIRED=false`, it logs a warning and continues to run.

## Auth and Hooks Scaffold (Default Template State)

Generated projects include sample auth scaffolding as commented templates:

- `app/routes/auth.module.ts`
- `app/controllers/auth.controller.ts`
- `app/services/auth.service.ts`
- `app/common/guards/admin-auth.guard.ts`
- `app/hooks/auth.hook.ts`

These files document connection flow only and do not register active auth endpoints by default.

## Generated Backend Stack

Each generated backend project includes:

- Node.js + TypeScript
- Express.js API
- Socket.IO realtime support
- MongoDB + Mongoose
- JWT + bcrypt dependencies ready for auth implementation
- Commented auth scaffolds (route/controller/service/guard/hook)
- Optional Redis caching
- Jest + Supertest tests
- ESLint + Prettier setup
- Docker Compose (`api`, `mongo`, `redis`)
