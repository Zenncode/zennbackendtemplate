import express from 'express';
import { getCache, setCache } from './services/cache.service';

type HealthResponse = {
  status: 'ok';
  generatedAt: string;
};

export function createApp() {
  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(',').map((value) => value.trim())
    : ['*'];

  app.use(express.json());
  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;

    if (allowedOrigins.includes('*') && requestOrigin) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });

  app.get('/', (_req, res) => {
    const socketPath = process.env.SOCKET_PATH?.trim() || '/socket.io';
    const normalizedSocketPath = socketPath.startsWith('/') ? socketPath : `/${socketPath}`;

    res.status(200).json({
      message: 'ZENNTECHINC Backend API is running',
      health: '/api/health',
      socket: normalizedSocketPath,
    });
  });

  app.get('/api/health', async (_req, res) => {
    const healthCacheKey = 'api:health';
    const healthTtlSeconds = Number(process.env.REDIS_HEALTH_TTL_SECONDS ?? '15');
    const cachedHealth = await getCache<HealthResponse>(healthCacheKey);

    if (cachedHealth) {
      res.status(200).json(cachedHealth);
      return;
    }

    const payload: HealthResponse = {
      status: 'ok',
      generatedAt: new Date().toISOString(),
    };

    await setCache(healthCacheKey, payload, healthTtlSeconds);
    res.status(200).json(payload);
  });

  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}
