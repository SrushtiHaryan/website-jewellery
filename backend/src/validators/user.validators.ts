import { z } from 'zod';
import { objectId } from './common';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    phone: z.string().min(7).max(20).optional(),
  }),
});

export const addressBodySchema = z.object({
  label: z.string().max(40).optional(),
  fullName: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  postalCode: z.string().min(4).max(12),
  country: z.string().min(2).max(60).default('India'),
  isDefault: z.boolean().optional(),
});

export const createAddressSchema = z.object({
  body: addressBodySchema,
});

export const updateAddressSchema = z.object({
  params: z.object({ addressId: objectId }),
  body: addressBodySchema.partial(),
});

export const addressIdParamSchema = z.object({
  params: z.object({ addressId: objectId }),
});
