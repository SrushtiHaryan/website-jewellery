import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env';
import routes from './routes';
import { apiLimiter } from './middleware/rateLimiter';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  // Behind a proxy in production (needed for secure cookies & rate limiting).
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      // Allow the configured client URL, local dev, and any Vercel deployment
      // (production + preview URLs). Requests without an Origin (curl, server-to
      // -server) are allowed too.
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = [env.clientUrl, 'http://localhost:3000'];
        let host = '';
        try {
          host = new URL(origin).hostname;
        } catch {
          /* malformed origin */
        }
        if (allowed.includes(origin) || host.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (!env.isTest) {
    app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  }

  // Rate limit the API surface.
  app.use('/api', apiLimiter);

  // Mount all versioned-less REST routes under /api.
  app.use('/api', routes);

  app.get('/', (_req, res) => {
    res.json({ success: true, data: { name: 'Aurelia Jewellery API', docs: '/api/health' } });
  });

  // 404 + centralised error handling (must be last).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
