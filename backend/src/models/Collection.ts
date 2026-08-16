import { Schema, model, Document } from 'mongoose';

export type CollectionKey =
  | 'bridal'
  | 'festive'
  | 'everyday'
  | 'royal'
  | 'minimal'
  | 'new-arrivals';

export interface ICollection extends Document {
  name: string;
  slug: string;
  key?: CollectionKey;
  description?: string;
  tagline?: string;
  image?: { url: string; publicId?: string; alt?: string };
  seoTitle?: string;
  seoDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    key: {
      type: String,
      enum: ['bridal', 'festive', 'everyday', 'royal', 'minimal', 'new-arrivals'],
    },
    description: { type: String, trim: true },
    tagline: { type: String, trim: true },
    image: {
      url: { type: String },
      publicId: { type: String },
      alt: { type: String },
    },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Collection = model<ICollection>('Collection', collectionSchema);
