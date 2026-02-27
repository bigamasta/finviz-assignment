import type { FastifyInstance } from 'fastify';
import { sql } from '../db/index.js';

export async function searchRoutes(app: FastifyInstance) {
  // GET /api/search?q=...&limit=20&offset=0
  app.get<{
    Querystring: { q: string; limit?: string; offset?: string };
  }>(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['q'],
          properties: {
            q: { type: 'string', minLength: 1 },
            limit: { type: 'string' },
            offset: { type: 'string' },
          },
        },
      },
    },
    async (req, reply) => {
      const { q, limit = '20', offset = '0' } = req.query;

      if (!q || q.trim().length === 0) {
        return reply.status(400).send({ error: 'Query parameter "q" is required' });
      }

      const lim = Math.min(parseInt(limit, 10) || 20, 100);
      const off = parseInt(offset, 10) || 0;
      const pattern = `%${q.trim()}%`;

      const [results, [countResult]] = await Promise.all([
        sql<{ path: string; name: string; size: number }[]>`
          SELECT path, name, size
          FROM taxonomy_nodes
          WHERE name ILIKE ${pattern}
          ORDER BY size DESC, name ASC
          LIMIT ${lim} OFFSET ${off}
        `,
        sql<{ count: string }[]>`
          SELECT COUNT(*)::text AS count
          FROM taxonomy_nodes
          WHERE name ILIKE ${pattern}
        `,
      ]);

      return {
        results,
        total: parseInt(countResult.count, 10),
        query: q.trim(),
        limit: lim,
        offset: off,
      };
    },
  );
}
