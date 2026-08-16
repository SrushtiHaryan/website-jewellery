import { Request, Response } from 'express';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

async function getUserOrThrow(id: string) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found.');
  return user;
}

export const userController = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await getUserOrThrow(req.user!.sub);
    sendSuccess(res, user);
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await getUserOrThrow(req.user!.sub);
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    await user.save();
    sendSuccess(res, user, { message: 'Profile updated.' });
  }),

  listAddresses: asyncHandler(async (req: Request, res: Response) => {
    const user = await getUserOrThrow(req.user!.sub);
    sendSuccess(res, user.addresses);
  }),

  addAddress: asyncHandler(async (req: Request, res: Response) => {
    const user = await getUserOrThrow(req.user!.sub);
    const makeDefault = req.body.isDefault || user.addresses.length === 0;
    if (makeDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }
    user.addresses.push({ ...req.body, isDefault: makeDefault });
    await user.save();
    sendSuccess(res, user.addresses, { status: 201, message: 'Address added.' });
  }),

  updateAddress: asyncHandler(async (req: Request, res: Response) => {
    const user = await getUserOrThrow(req.user!.sub);
    const address = user.addresses.id(req.params.addressId);
    if (!address) throw ApiError.notFound('Address not found.');

    if (req.body.isDefault === true) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }
    address.set(req.body);
    await user.save();
    sendSuccess(res, user.addresses, { message: 'Address updated.' });
  }),

  deleteAddress: asyncHandler(async (req: Request, res: Response) => {
    const user = await getUserOrThrow(req.user!.sub);
    const address = user.addresses.id(req.params.addressId);
    if (!address) throw ApiError.notFound('Address not found.');
    const wasDefault = address.isDefault;
    address.deleteOne();
    // Promote a new default if we removed the default one.
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    sendSuccess(res, user.addresses, { message: 'Address removed.' });
  }),

  setDefaultAddress: asyncHandler(async (req: Request, res: Response) => {
    const user = await getUserOrThrow(req.user!.sub);
    const address = user.addresses.id(req.params.addressId);
    if (!address) throw ApiError.notFound('Address not found.');
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
    address.isDefault = true;
    await user.save();
    sendSuccess(res, user.addresses, { message: 'Default address set.' });
  }),
};
