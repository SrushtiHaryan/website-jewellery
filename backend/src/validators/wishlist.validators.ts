import { z } from 'zod';
import { objectId } from './common';

export const addWishlistSchema = z.object({
  body: z.object({ productId: objectId }),
});

export const wishlistProductParamSchema = z.object({
  params: z.object({ productId: objectId }),
});

export const moveToCartSchema = z.object({
  params: z.object({ productId: objectId }),
  body: z.object({ size: z.string().max(20).optional() }).optional(),
});
