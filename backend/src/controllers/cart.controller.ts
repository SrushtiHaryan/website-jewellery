import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';

export const cartController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, await cartService.get(req.user!.sub));
  }),

  add: asyncHandler(async (req: Request, res: Response) => {
    const { productId, quantity, size } = req.body;
    const cart = await cartService.addItem(req.user!.sub, productId, quantity, size);
    sendSuccess(res, cart, { message: 'Added to cart.' });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.updateItem(
      req.user!.sub,
      req.params.itemId,
      req.body.quantity
    );
    sendSuccess(res, cart, { message: 'Cart updated.' });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.removeItem(req.user!.sub, req.params.itemId);
    sendSuccess(res, cart, { message: 'Item removed.' });
  }),

  clear: asyncHandler(async (req: Request, res: Response) => {
    const cart = await cartService.clear(req.user!.sub);
    sendSuccess(res, cart, { message: 'Cart cleared.' });
  }),
};
