import dotenv from 'dotenv';
import path from 'path';

// Load .env from the backend root regardless of where the process is started.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Centralised, typed access to environment variables.
 * Keeping this in one place means the rest of the app never reads
 * `process.env` directly and we fail fast when something critical is missing.
 */
const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  port: Number(process.env.PORT ?? 5000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
  serverUrl: process.env.SERVER_URL ?? 'http://localhost:5000',

  // Empty in dev => in-memory MongoDB is spun up automatically.
  mongoUri: process.env.MONGODB_URI ?? '',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? '',
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
  },

  email: {
    host: process.env.EMAIL_HOST ?? '',
    port: Number(process.env.EMAIL_PORT ?? 587),
    user: process.env.EMAIL_USER ?? '',
    password: process.env.EMAIL_PASSWORD ?? '',
    from: process.env.EMAIL_FROM ?? 'Aurelia Jewellery <no-reply@aurelia.example>',
  },
} as const;

/**
 * In production we must have real secrets and a real database.
 * Warn loudly in dev, throw in prod.
 */
export function assertProductionEnv(): void {
  if (!env.isProduction) return;

  const missing: string[] = [];
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.JWT_ACCESS_SECRET) missing.push('JWT_ACCESS_SECRET');
  if (!process.env.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET');

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(', ')}`
    );
  }
}

export default env;
