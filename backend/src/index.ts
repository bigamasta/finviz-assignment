import Fastify from 'fastify';
import cors from '@fastify/cors';
import { nodesRoutes } from './routes/nodes.js';
import { searchRoutes } from './routes/search.js';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
});

await app.register(nodesRoutes, { prefix: '/api/nodes' });
await app.register(searchRoutes, { prefix: '/api/search' });

app.get('/health', async () => ({ status: 'ok' }));

const port = parseInt(process.env.PORT ?? '3001', 10);

try {
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`Backend running on http://0.0.0.0:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
