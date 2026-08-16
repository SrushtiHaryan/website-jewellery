import mongoose from 'mongoose';
import { Review, IReview } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { ApiError } from '../utils/ApiError';

/**
 * Recompute a product's rating aggregates from its approved reviews. Called
 * whenever reviews change so sorting/filtering by rating stays accurate.
 */
async function recomputeProductRating(productId: mongoose.Types.ObjectId | string): Promise<void> {
  const stats = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)), isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    { $project: { _id: 0, avg: 1, count: 1 } },
  ]);
  const { avg = 0, count = 0 } = stats[0] ?? {};
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: count,
  });
}

export const reviewService = {
  async listByProductSlug(slug: string) {
    const product = await Product.findOne({ slug }).select('_id').lean();
    if (!product) throw ApiError.notFound('Product not found.');
    return Review.find({ product: product._id, isApproved: true })
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: 'name' });
  },

  async create(
    userId: string,
    productId: string,
    data: { rating: number; title?: string; comment: string }
  ): Promise<IReview> {
    const product = await Product.findById(productId).select('_id');
    if (!product) throw ApiError.notFound('Product not found.');

    // Verify the user actually purchased & received this product.
    const purchase = await Order.findOne({
      customer: userId,
      'items.product': productId,
      orderStatus: { $in: ['delivered'] },
    }).select('_id');
    if (!purchase) {
      throw ApiError.forbidden('You can only review products you have purchased and received.');
    }

    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) throw ApiError.conflict('You have already reviewed this product.');

    const review = await Review.create({
      product: productId,
      user: userId,
      order: purchase._id,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
    });
    await recomputeProductRating(productId);
    return review;
  },

  // ---- Admin moderation ----
  async listAll(page: number, limit: number, approved?: boolean) {
    const filter = approved === undefined ? {} : { isApproved: approved };
    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: 'user', select: 'name email' })
        .populate({ path: 'product', select: 'name slug' }),
      Review.countDocuments(filter),
    ]);
    return { items, total };
  },

  async setApproval(reviewId: string, isApproved: boolean): Promise<IReview> {
    const review = await Review.findByIdAndUpdate(reviewId, { isApproved }, { new: true });
    if (!review) throw ApiError.notFound('Review not found.');
    await recomputeProductRating(review.product);
    return review;
  },

  async remove(reviewId: string): Promise<void> {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) throw ApiError.notFound('Review not found.');
    await recomputeProductRating(review.product);
  },
};
