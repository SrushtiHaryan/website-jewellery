import { BlogPost, IBlogPost } from '../models/BlogPost';
import { ApiError } from '../utils/ApiError';
import { generateUniqueSlug } from '../utils/slug';

export const blogService = {
  async listAll(page: number, limit: number) {
    const [items, total] = await Promise.all([
      BlogPost.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-content')
        .populate({ path: 'author', select: 'name' }),
      BlogPost.countDocuments(),
    ]);
    return { items, total };
  },

  async getById(id: string): Promise<IBlogPost> {
    const post = await BlogPost.findById(id);
    if (!post) throw ApiError.notFound('Article not found.');
    return post;
  },

  async create(authorId: string, data: Record<string, unknown>): Promise<IBlogPost> {
    const slug = await generateUniqueSlug(
      BlogPost,
      (data.slug as string) || (data.title as string)
    );
    const publishedAt =
      data.isPublished && !data.publishedAt ? new Date() : (data.publishedAt as Date | undefined);
    return BlogPost.create({ ...data, slug, author: authorId, publishedAt });
  },

  async update(id: string, data: Record<string, unknown>): Promise<IBlogPost> {
    const post = await BlogPost.findById(id);
    if (!post) throw ApiError.notFound('Article not found.');
    if (data.slug || (data.title && data.title !== post.title)) {
      post.slug = await generateUniqueSlug(
        BlogPost,
        (data.slug as string) || (data.title as string),
        id
      );
    }
    // Set publishedAt the first time it is published.
    if (data.isPublished === true && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    Object.assign(post, data);
    await post.save();
    return post;
  },

  async remove(id: string): Promise<void> {
    const result = await BlogPost.findByIdAndDelete(id);
    if (!result) throw ApiError.notFound('Article not found.');
  },
};
