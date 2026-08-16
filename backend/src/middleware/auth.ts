import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken, JwtPayload, UserRole } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

// Augment Express Request with the authenticated user payload.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  // Support httpOnly cookie fallback used by the web client.
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken as string;
  }
  return null;
}

/**
 * Requires a valid access token. Attaches `req.user`.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized('Authentication token missing.');
  }
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token.');
  }
}

/**
 * Restrict a route to one or more roles. Use after `authenticate`.
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action.');
    }
    next();
  };
}

/**
 * Optional auth: attaches `req.user` if a valid token is present, but never
 * rejects. Useful for endpoints that behave differently for logged-in users.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      /* ignore invalid token for optional auth */
    }
  }
  next();
}
