import { v2 as cloudinary } from 'cloudinary';
import env from './env';

let configured = false;

/**
 * Lazily configure the Cloudinary SDK from env. Returns whether credentials
 * are present, so callers can fail gracefully when it isn't set up.
 */
export function getCloudinary() {
  if (!configured) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
  );
}
