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

// Configure CORS for frontend access
server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

let PORT = parseInt(process.env.PORT || '5001', 10);
const HOST = '0.0.0.0';

const start = async () => {
  try {
    await server.listen({ port: PORT, host: HOST });
    server.log.info(`Server running at http://localhost:${PORT}`);
  } catch (err: any) {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = PORT === 5000 ? 5001 : PORT + 1;
      server.log.warn(`Port ${PORT} is in use (often used by macOS AirPlay Receiver). Retrying on port ${fallbackPort}...`);
      PORT = fallbackPort;
      try {
        await server.listen({ port: PORT, host: HOST });
        server.log.info(`Server running at http://localhost:${PORT}`);
      } catch (retryErr) {
        server.log.error(retryErr);
        process.exit(1);
      }
    } else {
      server.log.error(err);
      process.exit(1);
    }
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
