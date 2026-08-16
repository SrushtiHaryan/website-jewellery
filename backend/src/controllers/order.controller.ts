import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';

export const orderController = {
  // ---- Customer ----
  create: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.create({
      userId: req.user!.sub,
      addressId: req.body.addressId,
      paymentMethod: req.body.paymentMethod,
      paymentPayload: req.body.paymentPayload,
    });
    sendSuccess(res, order, { status: 201, message: 'Order placed successfully.' });
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const { items, total } = await orderService.listForCustomer(req.user!.sub, page, limit);
    sendSuccess(res, items, { meta: buildPaginationMeta(page, limit, total) });
  }),

  getMine: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getForCustomer(req.user!.sub, req.params.id);
    sendSuccess(res, order);
  }),

  cancelMine: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.cancelByCustomer(
      req.user!.sub,
      req.params.id,
      req.body.reason
    );
    sendSuccess(res, order, { message: 'Order cancelled.' });
  }),

  // ---- Admin ----
  listAll: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const { items, total } = await orderService.listForAdmin({
      page,
      limit,
      status: req.query.status as never,
      paymentStatus: req.query.paymentStatus as never,
      search: req.query.search as string | undefined,
    });
    sendSuccess(res, items, { meta: buildPaginationMeta(page, limit, total) });
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getForAdmin(req.params.id);
    sendSuccess(res, order);
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.updateStatus(
      req.params.id,
      req.body.status,
      req.body.note
    );
    sendSuccess(res, order, { message: 'Order status updated.' });
  }),

  updatePaymentStatus: asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.updatePaymentStatus(req.params.id, req.body.paymentStatus);
    sendSuccess(res, order, { message: 'Payment status updated.' });
  }),
};
