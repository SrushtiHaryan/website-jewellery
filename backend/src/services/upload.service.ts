import { getCloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

export interface UploadedImage {
  url: string;
  publicId: string;
}

/**
 * Upload an image buffer to Cloudinary and return its secure URL + public id.
 * The public id is stored on the product so the image can be deleted later.
 */
export const uploadService = {
  async uploadBuffer(buffer: Buffer, folder = 'aurelia/products'): Promise<UploadedImage> {
    if (!isCloudinaryConfigured()) {
      throw ApiError.badRequest('Image uploads are not configured (missing Cloudinary keys).');
    }
    const cloudinary = getCloudinary();

    return new Promise<UploadedImage>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          // Sensible transforms: cap dimensions, auto format & quality.
          transformation: [{ width: 1600, height: 1600, crop: 'limit' }, { quality: 'auto' }],
        },
        (error, result) => {
          if (error || !result) {
            reject(ApiError.internal(`Image upload failed: ${error?.message ?? 'unknown error'}`));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      stream.end(buffer);
    });
  },

  async destroy(publicId: string): Promise<void> {
    if (!isCloudinaryConfigured() || !publicId) return;
    try {
      await getCloudinary().uploader.destroy(publicId);
    } catch {
      /* best-effort cleanup — never block on a failed delete */
    }
  },
};
