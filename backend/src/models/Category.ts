import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  // A category can be a subcategory of another (e.g. "Jhumkas" under "Earrings").
  parent?: Types.ObjectId | null;
  image?: { url: string; publicId?: string; alt?: string };
  seoTitle?: string;
  seoDescription?: string;
  heading?: string; // H1 override for the category page
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    image: {
      url: { type: String },
      publicId: { type: String },
      alt: { type: String },
    },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    heading: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = model<ICategory>('Category', categorySchema);
