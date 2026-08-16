import { Cart } from '../models/Cart';
import { Product, IProduct } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { calculatePricing, PricingResult } from '../utils/pricing';

export interface CartLineView {
  _id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    image?: string;
    price: number;
    discountPercent: number;
    finalPrice: number;
    stock: number;
  };
  quantity: number;
  size?: string;
  lineTotal: number;
  issue?: 'out_of_stock' | 'insufficient_stock' | 'unavailable';
}

export interface CartView {
  items: CartLineView[];
  pricing: PricingResult;
  hasIssues: boolean;
}

async function getOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

function primaryImage(product: IProduct): string | undefined {
  return product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url;
}

/**
 * Build a rich view of the cart with live product data, per-line issues and
 * computed totals. This never mutates the cart.
 */
async function buildCartView(userId: string): Promise<CartView> {
  const cart = await getOrCreateCart(userId);
  const productIds = cart.items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const map = new Map(products.map((p) => [String(p._id), p]));

  const items: CartLineView[] = [];
  for (const item of cart.items) {
    const product = map.get(String(item.product));
    if (!product || !product.isActive) {
      items.push({
        _id: String(item._id),
        product: {
          id: String(item.product),
          name: 'Unavailable product',
          slug: '',
          sku: '',
          price: 0,
          discountPercent: 0,
          finalPrice: 0,
          stock: 0,
        },
        quantity: item.quantity,
        size: item.size,
        lineTotal: 0,
        issue: 'unavailable',
      });
      continue;
    }

    let issue: CartLineView['issue'];
    if (product.stock === 0) issue = 'out_of_stock';
    else if (item.quantity > product.stock) issue = 'insufficient_stock';

    items.push({
      _id: String(item._id),
      product: {
        id: String(product._id),
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: primaryImage(product),
        price: product.price,
        discountPercent: product.discountPercent,
        finalPrice: product.finalPrice,
        stock: product.stock,
      },
      quantity: item.quantity,
      size: item.size,
      lineTotal: product.finalPrice * item.quantity,
      issue,
    });
  }

  const pricing = calculatePricing(
    items
      .filter((i) => !i.issue)
      .map((i) => ({
        price: i.product.price,
        discountPercent: i.product.discountPercent,
        quantity: i.quantity,
      }))
  );

  return { items, pricing, hasIssues: items.some((i) => i.issue) };
}

export const cartService = {
  get: buildCartView,

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    size?: string
  ): Promise<CartView> {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) throw ApiError.notFound('Product not found.');
    if (product.stock < 1) throw ApiError.badRequest('Product is out of stock.');

    const cart = await getOrCreateCart(userId);
    const existing = cart.items.find(
      (i) => String(i.product) === productId && i.size === size
    );
    const nextQty = (existing?.quantity ?? 0) + quantity;
    if (nextQty > product.stock) {
      throw ApiError.badRequest(`Only ${product.stock} in stock.`);
    }

    if (existing) existing.quantity = nextQty;
    else cart.items.push({ product: product._id, quantity, size } as never);

    await cart.save();
    return buildCartView(userId);
  },

  async updateItem(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<CartView> {
    const cart = await getOrCreateCart(userId);
    const item = cart.items.id(itemId);
    if (!item) throw ApiError.notFound('Cart item not found.');

    const product = await Product.findById(item.product);
    if (!product || !product.isActive) throw ApiError.badRequest('Product is unavailable.');
    if (quantity > product.stock) throw ApiError.badRequest(`Only ${product.stock} in stock.`);

    item.quantity = quantity;
    await cart.save();
    return buildCartView(userId);
  },

  async removeItem(userId: string, itemId: string): Promise<CartView> {
    const cart = await getOrCreateCart(userId);
    const item = cart.items.id(itemId);
    if (item) {
      item.deleteOne();
      await cart.save();
    }
    return buildCartView(userId);
  },

  async clear(userId: string): Promise<CartView> {
    const cart = await getOrCreateCart(userId);
    cart.items.splice(0, cart.items.length);
    await cart.save();
    return buildCartView(userId);
  },
};
