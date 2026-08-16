import mongoose, { FilterQuery } from 'mongoose';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { User } from '../models/User';
import {
  Order,
  IOrder,
  IOrderItem,
  IOrderAddress,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../models/Order';
import { ApiError } from '../utils/ApiError';
import { calculatePricing } from '../utils/pricing';
import { paymentService } from './payment.service';
import { emailService } from './email.service';

// Which status transitions are allowed, to prevent nonsensical jumps.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'returned'],
  out_for_delivery: ['delivered', 'returned'],
  delivered: ['returned', 'refunded'],
  cancelled: [],
  returned: ['refunded'],
  refunded: [],
};

function generateOrderNumber(): string {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
    date.getDate()
  ).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AUR-${stamp}-${rand}`;
}

export interface CreateOrderInput {
  userId: string;
  addressId: string;
  paymentMethod: PaymentMethod;
  paymentPayload?: Record<string, unknown>;
}

export const orderService = {
  async create(input: CreateOrderInput): Promise<IOrder> {
    const { userId, addressId, paymentMethod } = input;

    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found.');
    const address = user.addresses.id(addressId);
    if (!address) throw ApiError.badRequest('Selected address does not exist.');

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Your cart is empty.');
    }

    const shippingAddress: IOrderAddress = {
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    };

    const session = await mongoose.startSession();
    try {
      let created: IOrder | undefined;

      await session.withTransaction(async () => {
        const items: IOrderItem[] = [];
        const pricingLines: { price: number; discountPercent: number; quantity: number }[] = [];

        for (const cartItem of cart.items) {
          const product = await Product.findById(cartItem.product).session(session);
          if (!product || !product.isActive) {
            throw ApiError.badRequest('A product in your cart is no longer available.');
          }
          if (product.stock < cartItem.quantity) {
            throw ApiError.badRequest(
              `Only ${product.stock} of "${product.name}" left in stock.`
            );
          }

          // Prices are recalculated from the live product — never trusted from
          // the client. finalPrice already accounts for the discount.
          const unitPrice = product.finalPrice;
          items.push({
            product: product._id,
            productName: product.name,
            slug: product.slug,
            sku: product.sku,
            image: product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url,
            priceAtPurchase: unitPrice,
            quantity: cartItem.quantity,
            size: cartItem.size,
            lineTotal: unitPrice * cartItem.quantity,
          });
          pricingLines.push({
            price: product.price,
            discountPercent: product.discountPercent,
            quantity: cartItem.quantity,
          });

          // Atomic, guarded decrement prevents overselling under concurrency.
          const updated = await Product.updateOne(
            { _id: product._id, stock: { $gte: cartItem.quantity } },
            { $inc: { stock: -cartItem.quantity, salesCount: cartItem.quantity } },
            { session }
          );
          if (updated.modifiedCount !== 1) {
            throw ApiError.conflict(`"${product.name}" just went out of stock.`);
          }
        }

        // Authoritative pricing computed server-side from live product data.
        const finalPricing = calculatePricing(pricingLines);

        const provider = paymentService.getProvider(paymentMethod);
        const orderNumber = generateOrderNumber();
        const intent = await provider.createIntent(finalPricing.total, orderNumber);

        // Determine payment status. COD stays pending; online is verified now.
        let paymentStatus: PaymentStatus = 'pending';
        let paymentReference = intent.reference;
        if (paymentMethod !== 'cod') {
          const verification = await provider.verify({
            ...input.paymentPayload,
            reference: intent.reference,
          });
          if (!verification.verified) {
            throw ApiError.badRequest('Payment could not be verified.');
          }
          paymentStatus = 'paid';
          paymentReference = verification.reference || intent.reference;
        }

        const estimatedDeliveryDate = new Date();
        estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);

        const [order] = await Order.create(
          [
            {
              orderNumber,
              customer: userId,
              items,
              shippingAddress,
              subtotal: finalPricing.subtotal,
              discount: finalPricing.discount,
              shipping: finalPricing.shipping,
              tax: finalPricing.tax,
              total: finalPricing.total,
              paymentMethod,
              paymentStatus,
              paymentReference,
              orderStatus: paymentStatus === 'paid' ? 'confirmed' : 'pending',
              timeline: [
                { status: 'pending', note: 'Order placed', at: new Date() },
                ...(paymentStatus === 'paid'
                  ? [{ status: 'confirmed' as OrderStatus, note: 'Payment received', at: new Date() }]
                  : []),
              ],
              estimatedDeliveryDate,
            },
          ],
          { session }
        );

        // Empty the cart within the same transaction.
        cart.items.splice(0, cart.items.length);
        await cart.save({ session });

        created = order;
      });

      if (!created) throw ApiError.internal('Order could not be created.');

      await emailService
        .sendOrderConfirmation(user.email, created.orderNumber, created.total)
        .catch(() => undefined);

      return created;
    } finally {
      session.endSession();
    }
  },

  async listForCustomer(userId: string, page: number, limit: number) {
    const filter = { customer: userId };
    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(filter),
    ]);
    return { items, total };
  },

  async getForCustomer(userId: string, orderId: string): Promise<IOrder> {
    const order = await Order.findOne({ _id: orderId, customer: userId });
    if (!order) throw ApiError.notFound('Order not found.');
    return order;
  },

  async cancelByCustomer(userId: string, orderId: string, reason?: string): Promise<IOrder> {
    const order = await Order.findOne({ _id: orderId, customer: userId });
    if (!order) throw ApiError.notFound('Order not found.');
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      throw ApiError.badRequest('This order can no longer be cancelled.');
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // Restock cancelled items.
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity, salesCount: -item.quantity } },
            { session }
          );
        }
        order.orderStatus = 'cancelled';
        order.cancelledReason = reason;
        order.timeline.push({ status: 'cancelled', note: reason ?? 'Cancelled by customer', at: new Date() });
        await order.save({ session });
      });
    } finally {
      session.endSession();
    }
    return order;
  },

  // ---- Admin ----
  async listForAdmin(params: {
    page: number;
    limit: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
  }) {
    const filter: FilterQuery<IOrder> = {};
    if (params.status) filter.orderStatus = params.status;
    if (params.paymentStatus) filter.paymentStatus = params.paymentStatus;
    if (params.search) filter.orderNumber = new RegExp(params.search, 'i');

    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .populate({ path: 'customer', select: 'name email' }),
      Order.countDocuments(filter),
    ]);
    return { items, total };
  },

  async getForAdmin(orderId: string): Promise<IOrder> {
    const order = await Order.findById(orderId).populate({
      path: 'customer',
      select: 'name email phone',
    });
    if (!order) throw ApiError.notFound('Order not found.');
    return order;
  },

  async updateStatus(orderId: string, status: OrderStatus, note?: string): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found.');

    const allowed = ALLOWED_TRANSITIONS[order.orderStatus];
    if (!allowed.includes(status)) {
      throw ApiError.badRequest(
        `Cannot change status from "${order.orderStatus}" to "${status}".`
      );
    }
    order.orderStatus = status;
    order.timeline.push({ status, note, at: new Date() });
    if (status === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
    }
    await order.save();
    return order;
  },

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<IOrder> {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    );
    if (!order) throw ApiError.notFound('Order not found.');
    return order;
  },
};
