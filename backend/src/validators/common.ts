import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

/** Reusable Mongo ObjectId validator. */
export const objectId = z
  .string()
  .refine((v) => isValidObjectId(v), { message: 'Invalid id' });

/** Standard pagination query, coerced from strings. */
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});
