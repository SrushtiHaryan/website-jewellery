import { FilterQuery, isValidObjectId, Model } from 'mongoose';
import { Product, IProduct } from '../models/Product';
import { Category } from '../models/Category';
import { Collection } from '../models/Collection';
import { ApiError } from '../utils/ApiError';
import { generateUniqueSlug } from '../utils/slug';

export interface ProductListParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  subcategory?: string;
  collection?: string;
  material?: string;
  metalType?: string;
  stoneType?: string;
  occasion?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  sort: string;
  /** When true, ignore isActive (admin views). */
  includeInactive?: boolean;
}

const POPULATE = [
  { path: 'category', select: 'name slug' },
  { path: 'subcategory', select: 'name slug' },
  { path: 'collections', select: 'name slug' },
];

async function resolveRefId(
  value: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>
): Promise<string | null> {
  if (isValidObjectId(value)) return value;
  const doc = await model.findOne({ slug: value }).select('_id').lean<{ _id: unknown } | null>();
  return doc ? String(doc._id) : null;
}

function sortStage(sort: string): Record<string, 1 | -1> {
  switch (sort) {
    case 'newest':
      return { createdAt: -1 };
    case 'best-selling':
      return { salesCount: -1, createdAt: -1 };
    case 'price-asc':
      return { price: 1 };
    case 'price-desc':
      return { price: -1 };
    case 'rating':
      return { averageRating: -1, reviewCount: -1 };
    case 'featured':
    default:
      return { isFeatured: -1, salesCount: -1, createdAt: -1 };
  }
}

export const productService = {
  async list(params: ProductListParams): Promise<{ items: IProduct[]; total: number }> {
    const filter: FilterQuery<IProduct> = {};
    if (!params.includeInactive) filter.isActive = true;

    if (params.category) {
      const id = await resolveRefId(params.category, Category);
      if (!id) return { items: [], total: 0 };
      filter.category = id;
    }
    if (params.subcategory) {
      const id = await resolveRefId(params.subcategory, Category);
      if (!id) return { items: [], total: 0 };
      filter.subcategory = id;
    }
    if (params.collection) {
      const id = await resolveRefId(params.collection, Collection);
      if (!id) return { items: [], total: 0 };
      filter.collections = id;
    }
    if (params.material) filter.material = new RegExp(`^${escapeRegex(params.material)}$`, 'i');
    if (params.metalType) filter.metalType = new RegExp(`^${escapeRegex(params.metalType)}$`, 'i');
    if (params.stoneType) filter.stoneType = new RegExp(`^${escapeRegex(params.stoneType)}$`, 'i');
    if (params.occasion) filter.occasion = new RegExp(escapeRegex(params.occasion), 'i');
    if (params.featured !== undefined) filter.isFeatured = params.featured;
    if (params.newArrival !== undefined) filter.isNewArrival = params.newArrival;
    if (params.inStock === true) filter.stock = { $gt: 0 };
    if (params.minRating !== undefined) filter.averageRating = { $gte: params.minRating };

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      filter.price = {};
      if (params.minPrice !== undefined) filter.price.$gte = params.minPrice;
      if (params.maxPrice !== undefined) filter.price.$lte = params.maxPrice;
    }

    if (params.search) {
      filter.$text = { $search: params.search };
    }

    const skip = (params.page - 1) * params.limit;

    const [items, total] = await Promise.all([
      // Not using .lean() so schema virtuals (finalPrice, inStock) and the
      // toJSON transform are applied when the response is serialised.
      Product.find(filter)
        .sort(sortStage(params.sort))
        .skip(skip)
        .limit(params.limit)
        .populate(POPULATE),
      Product.countDocuments(filter),
    ]);

    return { items, total };
  },

  async getById(id: string): Promise<IProduct> {
    const product = await Product.findById(id).populate(POPULATE);
    if (!product) throw ApiError.notFound('Product not found.');
    return product;
  },

  async getBySlug(slug: string): Promise<IProduct> {
    const product = await Product.findOne({ slug, isActive: true }).populate(POPULATE);
    if (!product) throw ApiError.notFound('Product not found.');
    return product;
  },

  async getRelated(slug: string, limit = 4): Promise<IProduct[]> {
    const product = await Product.findOne({ slug }).select('category collections _id').lean();
    if (!product) return [];
    return Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [{ category: product.category }, { collections: { $in: product.collections } }],
    })
      .sort({ salesCount: -1 })
      .limit(limit)
      .populate(POPULATE);
  },

  async create(data: Record<string, unknown>): Promise<IProduct> {
    const slug = await generateUniqueSlug(Product, (data.slug as string) || (data.name as string));
    const product = await Product.create({ ...data, slug, sku: String(data.sku).toUpperCase() });
    return product.populate(POPULATE);
  },

  async update(id: string, data: Record<string, unknown>): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found.');

    // Regenerate slug only if name/slug explicitly changed.
    if (data.slug || (data.name && data.name !== product.name)) {
      product.slug = await generateUniqueSlug(
        Product,
        (data.slug as string) || (data.name as string),
        id
      );
    }
    Object.assign(product, data);
    if (data.sku) product.sku = String(data.sku).toUpperCase();
    await product.save();
    return product.populate(POPULATE);
  },

  async remove(id: string): Promise<void> {
    const result = await Product.findByIdAndDelete(id);
    if (!result) throw ApiError.notFound('Product not found.');
  },

  async setActive(id: string, isActive: boolean): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!product) throw ApiError.notFound('Product not found.');
    return product;
  },

  async updateInventory(id: string, stock: number): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(id, { stock }, { new: true });
    if (!product) throw ApiError.notFound('Product not found.');
    return product;
  },
};

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
