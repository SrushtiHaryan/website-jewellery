import { z } from 'zod';
import { objectId } from './common';

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
});

export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(160),
    slug: z.string().optional(),
    excerpt: z.string().max(400).optional(),
    content: z.string().min(20),
    featuredImage: imageSchema.optional(),
    category: z.string().max(60).optional(),
    tags: z.array(z.string()).optional(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(180).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const updateBlogSchema = z.object({
  params: z.object({ id: objectId }),
  body: createBlogSchema.shape.body.partial(),
});

export const blogIdParamSchema = z.object({
  params: z.object({ id: objectId }),
});
