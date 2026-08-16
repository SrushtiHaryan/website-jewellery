import { createApp } from './app';
import env, { assertProductionEnv } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { Product } from './models/Product';
import { runSeed } from './seed/runSeed';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  assertProductionEnv();
  await connectDatabase();

  // Auto-seed when the catalogue is empty. This makes the zero-install
  // in-memory database usable immediately; against a persistent DB it only
  // runs the first time (or use `npm run seed` to reseed explicitly).
  const productCount = await Product.estimatedDocumentCount();
  if (productCount === 0) {
    const shouldAutoSeed = !env.mongoUri || !env.isProduction;
    if (shouldAutoSeed) {
      logger.info('Empty catalogue detected — running initial seed.');
      await runSeed();
    }
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`Aurelia API listening on ${env.serverUrl} (${env.nodeEnv})`);
  });

  const shutdown = async (signal: string) => {
    logger.warn(`${signal} received — shutting down gracefully.`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Force-exit if it hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', reason);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
