import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';

export const adminService = {
  async getDashboardStats() {
    const [
      salesAgg,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStock,
      outOfStock,
      recentOrders,
      salesByDay,
    ] = await Promise.all([
      Order.aggregate<{ total: number }>([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockThreshold'] }, stock: { $gt: 0 } }),
      Product.countDocuments({ stock: 0 }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('orderNumber total orderStatus paymentStatus createdAt')
        .populate({ path: 'customer', select: 'name email' }),
      // Revenue per day for the last 14 days (paid orders).
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } },
      ]),
    ]);

    return {
      totalSales: salesAgg[0]?.total ?? 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts: lowStock,
      outOfStockProducts: outOfStock,
      recentOrders,
      salesByDay,
    };
  },

  async listProducts(params: { page: number; limit: number; search?: string }) {
    const filter = params.search
      ? { $or: [{ name: new RegExp(params.search, 'i') }, { sku: new RegExp(params.search, 'i') }] }
      : {};
    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .populate({ path: 'category', select: 'name slug' }),
      Product.countDocuments(filter),
    ]);
    return { items, total };
  },

  async getInventory(params: { page: number; limit: number }) {
    const [items, total] = await Promise.all([
      Product.find()
        .sort({ stock: 1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .select('name sku stock lowStockThreshold isActive'),
      Product.countDocuments(),
    ]);
    return { items, total };
  },
};
