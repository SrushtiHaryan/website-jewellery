import { z } from 'zod';
import { objectId } from './common';

export const addToCartSchema = z.object({
  body: z.object({
    productId: objectId,
    quantity: z.number().int().min(1).max(20).default(1),
    size: z.string().max(20).optional(),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({ itemId: objectId }),
  body: z.object({ quantity: z.number().int().min(1).max(20) }),
});

export const cartItemParamSchema = z.object({
  params: z.object({ itemId: objectId }),
});
