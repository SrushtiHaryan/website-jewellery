import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validates `req.body`, `req.query` and `req.params` against a Zod schema.
 * The schema shape is `{ body?, query?, params? }`. Parsed (and coerced)
 * values are written back so controllers get typed, clean input.
 */
export const validate =
  (schema: AnyZodObject) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body) req.body = parsed.body;
      // req.query / req.params are read-only getters in some Express versions;
      // assign defensively.
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        throw ApiError.badRequest('Validation failed.', details);
      }
      throw err;
    }
  };
