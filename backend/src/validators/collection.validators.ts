import { z } from 'zod';
import { objectId } from './common';

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
});

export const createCollectionSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    slug: z.string().optional(),
    key: z
      .enum(['bridal', 'festive', 'everyday', 'royal', 'minimal', 'new-arrivals'])
      .optional(),
    description: z.string().max(2000).optional(),
    tagline: z.string().max(200).optional(),
    image: imageSchema.optional(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(180).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    displayOrder: z.number().int().optional(),
  }),
});

export const updateCollectionSchema = z.object({
  params: z.object({ id: objectId }),
  body: createCollectionSchema.shape.body.partial(),
});

export const setCollectionProductsSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ productIds: z.array(objectId) }),
});
