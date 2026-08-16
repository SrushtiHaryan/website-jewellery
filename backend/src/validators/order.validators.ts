import { z } from 'zod';
import { objectId } from './common';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../models/Order';

export const createOrderSchema = z.object({
  body: z.object({
    addressId: objectId,
    paymentMethod: z.enum(['cod', 'mock', 'razorpay']),
    paymentPayload: z.record(z.unknown()).optional(),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const cancelOrderSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ reason: z.string().max(300).optional() }),
});

export const listOrdersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
    search: z.string().trim().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(ORDER_STATUSES),
    note: z.string().max(300).optional(),
  }),
});

export const updatePaymentStatusSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ paymentStatus: z.enum(PAYMENT_STATUSES) }),
});
