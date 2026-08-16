import dns from 'node:dns';
import mongoose from 'mongoose';
import env from './env';
import { logger } from '../utils/logger';

// Held only in dev/test so we can stop the in-memory server on shutdown.
let memoryServer: { stop: () => Promise<unknown> } | null = null;

/**
 * Connect to MongoDB.
 *
 * - If MONGODB_URI is set, connect to it (local mongod or Atlas).
 * - Otherwise, in development/test, spin up an ephemeral in-memory MongoDB
 *   so the project runs with zero database installation.
 */
export async function connectDatabase(): Promise<void> {
  let uri = env.mongoUri;

  // `mongodb+srv://` needs a DNS SRV lookup. Some networks (notably Windows
  // boxes that receive a link-local IPv6 DNS server) make Node's resolver fail
  // that lookup with `querySrv ECONNREFUSED`, even though the OS resolver works.
  // Pointing Node at public resolvers makes SRV/TXT lookups reliable.
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['1.1.1.1', '8.8.8.8']);
    } catch {
      /* ignore — fall back to system resolver */
    }
  }

  if (!uri) {
    if (env.isProduction) {
      throw new Error('MONGODB_URI is required in production.');
    }
    // Lazy import so mongodb-memory-server is never loaded in production.
    // A single-member replica set is used (not standalone) so that MongoDB
    // multi-document transactions work in dev exactly as they do on Atlas.
    const { MongoMemoryReplSet } = await import('mongodb-memory-server');
    const mem = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    memoryServer = mem;
    uri = mem.getUri('aurelia');
    logger.info('Started in-memory MongoDB replica set (no MONGODB_URI provided).');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  logger.info(`MongoDB connected: ${mongoose.connection.host}`);

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected.');
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
