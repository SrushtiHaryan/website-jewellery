import { z } from 'zod';
import { objectId } from './common';

export const createReviewSchema = z.object({
  body: z.object({
    productId: objectId,
    rating: z.number().int().min(1).max(5),
    title: z.string().max(120).optional(),
    comment: z.string().min(3).max(2000),
  }),
});

export const reviewProductSlugSchema = z.object({
  params: z.object({ slug: z.string().min(1) }),
});

export const reviewIdParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const moderateReviewSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ isApproved: z.boolean() }),
});
