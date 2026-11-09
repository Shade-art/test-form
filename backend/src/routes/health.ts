import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';

export const healthRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('/health', async (_request, reply) => {
    const startTime = Date.now();
    let databaseStatus = 'disconnected';
    let latencyMs = 0;

    try {
      // Execute a quick raw SQL query to test PostgreSQL connectivity
      await prisma.$queryRaw`SELECT 1`;
      latencyMs = Date.now() - startTime;
      databaseStatus = 'connected';

      return reply.code(200).send({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          status: databaseStatus,
          latencyMs,
        },
      });
    } catch (error) {
      fastify.log.error(error, 'Database health check failed');
      return reply.code(503).send({
        status: 'error',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Database check failed',
        },
      });
    }
  });
};
