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

From the generated project folder:

1. Create `.env` from the example:

```bash
cp .env.example .env
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

2. Make sure MongoDB is running.

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

3. Start backend in development:

```bash
npm run dev
```

4. Verify it is working:

```bash
curl http://localhost:3000/
curl http://localhost:3000/api/health
```

If MongoDB is not running, startup will fail with connection errors.
If you use another Mongo host, set `MONGODB_URI` in `.env`.

Optional first admin auto-seed:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

Production run:

```bash
npm run build
npm start
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
