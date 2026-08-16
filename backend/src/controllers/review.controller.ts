import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';

export const reviewController = {
  listByProduct: asyncHandler(async (req: Request, res: Response) => {
    const reviews = await reviewService.listByProductSlug(req.params.slug);
    sendSuccess(res, reviews);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.create(req.user!.sub, req.body.productId, {
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment,
    });
    sendSuccess(res, review, { status: 201, message: 'Thank you for your review.' });
  }),

  // ---- Admin ----
  listAll: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const approved =
      req.query.approved === undefined ? undefined : req.query.approved === 'true';
    const { items, total } = await reviewService.listAll(page, limit, approved);
    sendSuccess(res, items, { meta: buildPaginationMeta(page, limit, total) });
  }),

  moderate: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.setApproval(req.params.id, req.body.isApproved);
    sendSuccess(res, review, { message: 'Review updated.' });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await reviewService.remove(req.params.id);
    sendSuccess(res, null, { message: 'Review deleted.' });
  }),
};
