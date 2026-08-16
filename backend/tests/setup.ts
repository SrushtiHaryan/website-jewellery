import { beforeAll, afterAll } from 'vitest';
import { connectDatabase, disconnectDatabase } from '../src/config/db';
import { runSeed } from '../src/seed/runSeed';

// Force the zero-install in-memory database for tests.
process.env.NODE_ENV = 'test';
delete process.env.MONGODB_URI;

beforeAll(async () => {
  await connectDatabase();
  await runSeed();
});

afterAll(async () => {
  await disconnectDatabase();
});
