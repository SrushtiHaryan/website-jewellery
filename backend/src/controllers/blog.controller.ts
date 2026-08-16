import { Request, Response } from 'express';
import { BlogPost } from '../models/BlogPost';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export const blogController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 9);
    const filter = { isPublished: true };
    const [items, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-content')
        .populate({ path: 'author', select: 'name' }),
      BlogPost.countDocuments(filter),
    ]);
    sendSuccess(res, items, { meta: buildPaginationMeta(page, limit, total) });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true }).populate({
      path: 'author',
      select: 'name',
    });
    if (!post) throw ApiError.notFound('Article not found.');
    sendSuccess(res, post);
  }),
};
