import { Schema, model, Document, Types } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: { url: string; publicId?: string; alt?: string };
  author: Types.ObjectId;
  category?: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    featuredImage: {
      url: { type: String },
      publicId: { type: String },
      alt: { type: String },
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, trim: true },
    tags: { type: [String], default: [] },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

blogPostSchema.index({ isPublished: 1, publishedAt: -1 });

export const BlogPost = model<IBlogPost>('BlogPost', blogPostSchema);
