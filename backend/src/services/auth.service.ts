import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { ApiError } from '../utils/ApiError';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { emailService } from './email.service';
import env from '../config/env';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function issueTokens(user: IUser): AuthTokens {
  const payload = { sub: user.id as string, role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export const authService = {
  async register(input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ user: IUser; tokens: AuthTokens }> {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw ApiError.conflict('An account with this email already exists.');
    }
    const user = await User.create(input);
    await emailService.sendWelcome(user.email, user.name).catch(() => undefined);
    return { user, tokens: issueTokens(user) };
  },

  async login(email: string, password: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    // password has select:false, so request it explicitly.
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid email or password.');
    }
    const match = await user.comparePassword(password);
    if (!match) {
      throw ApiError.unauthorized('Invalid email or password.');
    }
    user.password = undefined as unknown as string; // never leak the hash
    return { user, tokens: issueTokens(user) };
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid refresh token.');
    }
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User no longer exists.');
    }
    return issueTokens(user);
  },

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    // Always resolve to avoid leaking which emails are registered.
    if (!user) return;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetToken = hashed;
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;
    await emailService.sendPasswordReset(user.email, resetUrl).catch(() => undefined);
  },

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw ApiError.badRequest('Password reset token is invalid or has expired.');
    }
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) throw ApiError.notFound('User not found.');
    const match = await user.comparePassword(currentPassword);
    if (!match) throw ApiError.badRequest('Current password is incorrect.');
    user.password = newPassword;
    await user.save();
  },
};
