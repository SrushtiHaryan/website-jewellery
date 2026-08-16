import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';
import { cartService } from './cart.service';
import { ApiError } from '../utils/ApiError';

const POPULATE = {
  path: 'products',
  match: { isActive: true },
  populate: { path: 'category', select: 'name slug' },
};

async function getOrCreate(userId: string) {
  let list = await Wishlist.findOne({ user: userId });
  if (!list) list = await Wishlist.create({ user: userId, products: [] });
  return list;
}

export const wishlistService = {
  async get(userId: string) {
    const list = await getOrCreate(userId);
    return list.populate(POPULATE);
  },

  async add(userId: string, productId: string) {
    const product = await Product.findById(productId).select('_id isActive');
    if (!product || !product.isActive) throw ApiError.notFound('Product not found.');
    const list = await getOrCreate(userId);
    if (!list.products.some((p) => String(p) === productId)) {
      list.products.push(product._id);
      await list.save();
    }
    return list.populate(POPULATE);
  },

  async remove(userId: string, productId: string) {
    const list = await getOrCreate(userId);
    list.products = list.products.filter((p) => String(p) !== productId) as never;
    await list.save();
    return list.populate(POPULATE);
  },

  async moveToCart(userId: string, productId: string, size?: string) {
    await cartService.addItem(userId, productId, 1, size);
    return wishlistService.remove(userId, productId);
  },
};
