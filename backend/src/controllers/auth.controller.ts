import { Request, Response } from 'express';
import { authService, AuthTokens } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import env from '../config/env';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

function setAuthCookies(res: Response, tokens: AuthTokens): void {
  const secure = env.isProduction;
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE);
  res.clearCookie(REFRESH_COOKIE);
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.register(req.body);
    setAuthCookies(res, tokens);
    sendSuccess(res, { user, ...tokens }, { status: 201, message: 'Account created.' });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(email, password);
    setAuthCookies(res, tokens);
    sendSuccess(res, { user, ...tokens }, { message: 'Signed in.' });
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    clearAuthCookies(res);
    sendSuccess(res, null, { message: 'Signed out.' });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = (req.body?.refreshToken as string) || req.cookies?.refreshToken;
    if (!token) throw ApiError.unauthorized('Refresh token missing.');
    const tokens = await authService.refresh(token);
    setAuthCookies(res, tokens);
    sendSuccess(res, tokens, { message: 'Token refreshed.' });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, {
      message: 'If that email exists, a reset link has been sent.',
    });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, null, { message: 'Password has been reset. Please sign in.' });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.changePassword(
      req.user!.sub,
      req.body.currentPassword,
      req.body.newPassword
    );
    sendSuccess(res, null, { message: 'Password updated.' });
  }),
};
