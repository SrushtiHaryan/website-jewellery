import { Schema, model, Document, Types } from 'mongoose';

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
  'refunded',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type PaymentMethod = 'cod' | 'mock' | 'razorpay';

/**
 * Line item stores a *snapshot* of the product at purchase time. Prices, names
 * and images must never change retroactively when the catalogue is edited.
 */
export interface IOrderItem {
  product: Types.ObjectId;
  productName: string;
  slug: string;
  sku: string;
  image?: string;
  priceAtPurchase: number;
  quantity: number;
  size?: string;
  lineTotal: number;
}

export interface IOrderAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrderTimelineEntry {
  status: OrderStatus;
  note?: string;
  at: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IOrderAddress;

  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;

  orderStatus: OrderStatus;
  timeline: IOrderTimelineEntry[];

  estimatedDeliveryDate?: Date;
  cancelledReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String },
    priceAtPurchase: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderAddressSchema = new Schema<IOrderAddress>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: orderAddressSchema, required: true },

    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    paymentMethod: { type: String, enum: ['cod', 'mock', 'razorpay'], required: true },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending',
      index: true,
    },
    paymentReference: { type: String },

    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
      index: true,
    },
    timeline: {
      type: [
        new Schema<IOrderTimelineEntry>(
          {
            status: { type: String, enum: ORDER_STATUSES, required: true },
            note: { type: String },
            at: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    estimatedDeliveryDate: { type: Date },
    cancelledReason: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });

export const Order = model<IOrder>('Order', orderSchema);
