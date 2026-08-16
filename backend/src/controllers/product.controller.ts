import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const q = req.query as Record<string, unknown>;
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 24);
    const { items, total } = await productService.list({
      ...(q as object),
      page,
      limit,
    } as never);
    sendSuccess(res, items, { meta: buildPaginationMeta(page, limit, total) });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getBySlug(req.params.slug);
    sendSuccess(res, product);
  }),

  getRelated: asyncHandler(async (req: Request, res: Response) => {
    const items = await productService.getRelated(req.params.slug);
    sendSuccess(res, items);
  }),
};
