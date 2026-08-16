import { z } from 'zod';
import { objectId } from './common';

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    slug: z.string().optional(),
    description: z.string().max(2000).optional(),
    parent: objectId.optional().nullable(),
    image: imageSchema.optional(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(180).optional(),
    heading: z.string().max(120).optional(),
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: objectId }),
  body: createCategorySchema.shape.body.partial(),
});

export const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});
