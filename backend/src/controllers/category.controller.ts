import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export const categoryController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .populate({ path: 'parent', select: 'name slug' });
    sendSuccess(res, categories);
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true }).populate({
      path: 'parent',
      select: 'name slug',
    });
    if (!category) throw ApiError.notFound('Category not found.');
    sendSuccess(res, category);
  }),
};
