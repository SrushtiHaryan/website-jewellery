import { Schema, model, Document, Types } from 'mongoose';

export interface IProductImage {
  url: string;
  publicId?: string;
  alt: string;
  isPrimary?: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;

  category: Types.ObjectId;
  subcategory?: Types.ObjectId | null;
  collections: Types.ObjectId[];

  // `price` is the list price (MRP). `discountPercent` drives the sale price.
  price: number;
  discountPercent: number;

  stock: number;
  lowStockThreshold: number;

  material?: string;
  metalType?: string;
  stoneType?: string;
  weightGrams?: number;
  dimensions?: string;
  sizes: string[];
  occasion: string[];
  tags: string[];

  images: IProductImage[];

  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;

  // Aggregates kept denormalised for fast sorting/filtering.
  averageRating: number;
  reviewCount: number;
  salesCount: number;

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;

  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  finalPrice: number;
  discountAmount: number;
  inStock: boolean;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true },

    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    collections: [{ type: Schema.Types.ObjectId, ref: 'Collection', index: true }],

    price: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 90 },

    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },

    material: { type: String, trim: true, index: true },
    metalType: { type: String, trim: true, index: true },
    stoneType: { type: String, trim: true, index: true },
    weightGrams: { type: Number, min: 0 },
    dimensions: { type: String, trim: true },
    sizes: { type: [String], default: [] },
    occasion: { type: [String], default: [], index: true },
    tags: { type: [String], default: [] },

    images: { type: [productImageSchema], default: [] },

    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },

    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0, index: true },

    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    canonicalUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Virtuals -------------------------------------------------------------
productSchema.virtual('finalPrice').get(function finalPrice(this: IProduct) {
  const price = Math.round(this.price * (1 - this.discountPercent / 100));
  return price;
});

productSchema.virtual('discountAmount').get(function discountAmount(this: IProduct) {
  return Math.round(this.price * (this.discountPercent / 100));
});

productSchema.virtual('inStock').get(function inStock(this: IProduct) {
  return this.stock > 0;
});

// --- Indexes --------------------------------------------------------------
// Full-text search across the fields the spec calls out.
productSchema.index(
  {
    name: 'text',
    shortDescription: 'text',
    description: 'text',
    material: 'text',
    metalType: 'text',
    stoneType: 'text',
    tags: 'text',
    sku: 'text',
  },
  {
    weights: { name: 10, tags: 6, shortDescription: 4, material: 3, description: 1 },
    name: 'product_text_index',
  }
);

// Common list/sort access patterns.
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ category: 1, isActive: 1 });

export const Product = model<IProduct>('Product', productSchema);
