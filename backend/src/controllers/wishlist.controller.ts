import { Request, Response } from 'express';
import { wishlistService } from '../services/wishlist.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';

export const wishlistController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await wishlistService.get(req.user!.sub));
  }),

  add: asyncHandler(async (req: Request, res: Response) => {
    const list = await wishlistService.add(req.user!.sub, req.body.productId);
    sendSuccess(res, list, { message: 'Added to wishlist.' });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const list = await wishlistService.remove(req.user!.sub, req.params.productId);
    sendSuccess(res, list, { message: 'Removed from wishlist.' });
  }),

  moveToCart: asyncHandler(async (req: Request, res: Response) => {
    const list = await wishlistService.moveToCart(
      req.user!.sub,
      req.params.productId,
      req.body?.size
    );
    sendSuccess(res, list, { message: 'Moved to cart.' });
  }),
};
