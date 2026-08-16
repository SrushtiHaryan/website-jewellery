/* eslint-disable no-console */

/**
 * Tiny structured-ish logger. Kept dependency-free on purpose; swap for pino
 * or winston later without touching call sites.
 */
type Level = 'info' | 'warn' | 'error' | 'debug';

function ts(): string {
  return new Date().toISOString();
}

function log(level: Level, message: string, meta?: unknown): void {
  const prefix = `[${ts()}] ${level.toUpperCase()}`;
  if (meta !== undefined) {
    console[level === 'debug' ? 'log' : level](`${prefix} ${message}`, meta);
  } else {
    console[level === 'debug' ? 'log' : level](`${prefix} ${message}`);
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  debug: (msg: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== 'production') log('debug', msg, meta);
  },
};
