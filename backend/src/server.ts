import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health';
import { applicationRoutes } from './routes/applications';
import { prisma } from './lib/prisma';

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Allowed origins restricted to the deployed Vercel frontend and local development
const allowedOrigins = [
  'https://test-form-three-mu.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Configure CORS for frontend access (must be registered before routes)
server.register(cors, {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
});

// Register API Routes
server.register(healthRoutes, { prefix: '/api' });
server.register(applicationRoutes, { prefix: '/api' });

// Root route for quick verification
server.get('/', async (_request, reply) => {
  return reply.send({
    name: 'Recruitment Form API',
    status: 'running',
    healthCheck: '/api/health',
    applicationsEndpoint: '/api/applications',
  });
});

const port = Number(process.env.PORT) || 5001;
const host = '0.0.0.0';

const start = async () => {
  try {
    await server.listen({
      port,
      host,
    });
    server.log.info(`Server running at http://${host}:${port}`);
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production' && err.code === 'EADDRINUSE') {
      const fallbackPort = port === 5000 ? 5001 : port + 1;
      server.log.warn(
        `Port ${port} is in use (often used by macOS AirPlay Receiver). Retrying on port ${fallbackPort}...`
      );
      try {
        await server.listen({ port: fallbackPort, host });
        server.log.info(`Server running at http://${host}:${fallbackPort}`);
        return;
      } catch (retryErr) {
        server.log.error(retryErr);
        process.exit(1);
      }
    }
    server.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown handling
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    server.log.info(`Received ${signal}. Shutting down gracefully...`);
    await server.close();
    await prisma.$disconnect();
    process.exit(0);
  });
});

start();
