import { z } from 'zod';
import { objectId } from './common';

export const PRODUCT_SORTS = [
  'featured',
  'newest',
  'best-selling',
  'price-asc',
  'price-desc',
  'rating',
] as const;

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(60).default(24),
    search: z.string().trim().optional(),
    category: z.string().trim().optional(), // slug or id
    subcategory: z.string().trim().optional(),
    collection: z.string().trim().optional(), // slug or id
    material: z.string().trim().optional(),
    metalType: z.string().trim().optional(),
    stoneType: z.string().trim().optional(),
    occasion: z.string().trim().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    inStock: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
    featured: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
    newArrival: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === 'true')),
    sort: z.enum(PRODUCT_SORTS).default('featured'),
  }),
});

export const productSlugSchema = z.object({
  params: z.object({ slug: z.string().min(1) }),
});

export const productIdSchema = z.object({
  params: z.object({ id: objectId }),
});

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().min(1),
  isPrimary: z.boolean().optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(160),
    sku: z.string().min(2).max(40),
    description: z.string().min(10),
    shortDescription: z.string().max(300).optional(),
    category: objectId,
    subcategory: objectId.optional(),
    collections: z.array(objectId).optional(),
    price: z.number().min(0),
    discountPercent: z.number().min(0).max(90).default(0),
    stock: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).default(5),
    material: z.string().optional(),
    metalType: z.string().optional(),
    stoneType: z.string().optional(),
    weightGrams: z.number().min(0).optional(),
    dimensions: z.string().optional(),
    sizes: z.array(z.string()).optional(),
    occasion: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    images: z.array(imageSchema).optional(),
    isFeatured: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isActive: z.boolean().optional(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(180).optional(),
    slug: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: objectId }),
  body: createProductSchema.shape.body.partial(),
});

export const updateInventorySchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ stock: z.number().int().min(0) }),
});
