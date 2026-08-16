import { Request, Response } from 'express';
import { Collection } from '../models/Collection';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export const collectionController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const collections = await Collection.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1,
    });
    sendSuccess(res, collections);
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const collection = await Collection.findOne({ slug: req.params.slug, isActive: true });
    if (!collection) throw ApiError.notFound('Collection not found.');
    sendSuccess(res, collection);
  }),
};
