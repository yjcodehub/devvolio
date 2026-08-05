import app from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';

async function startServer() {
  // Connect to Atlas Database
  await connectDatabase();

  // Listen on configured environment port on all network interfaces
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`[Server] Operational in [${env.NODE_ENV}] mode`);
    console.log(`[Server] Endpoint active: http://localhost:${env.PORT}/api/v1/health`);
  });
}

startServer().catch((error) => {
  console.error('[Server] Critical start failure:', error);
  process.exit(1);
});
