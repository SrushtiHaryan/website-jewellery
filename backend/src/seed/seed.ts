/* eslint-disable no-console */
import { connectDatabase, disconnectDatabase } from '../config/db';
import { runSeed } from './runSeed';
import { logger } from '../utils/logger';

/**
 * CLI seed entry point (`npm run seed`). Use this against a *persistent*
 * MongoDB (set MONGODB_URI). With the zero-install in-memory database the data
 * lives only for the process lifetime, so the server auto-seeds on startup
 * instead — see src/server.ts.
 */
async function main(): Promise<void> {
  await connectDatabase();
  await runSeed();
  await disconnectDatabase();
  process.exit(0);
}

main().catch((err) => {
  logger.error('Seed failed', err);
  process.exit(1);
});
