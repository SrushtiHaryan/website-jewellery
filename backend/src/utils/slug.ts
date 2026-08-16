import slugify from 'slugify';
import { Model } from 'mongoose';

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

/**
 * Generate a slug that is unique within a collection. If the base slug is
 * taken, append -2, -3, ... until free. `excludeId` lets an existing document
 * keep its own slug when updating.
 */
export async function generateUniqueSlug(
  model: Model<any>,
  source: string,
  excludeId?: string
): Promise<string> {
  const base = toSlug(source);
  let candidate = base;
  let counter = 2;

  // eslint-disable-next-line no-await-in-loop
  while (true) {
    const query: Record<string, unknown> = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    // eslint-disable-next-line no-await-in-loop
    const existing = await model.exists(query);
    if (!existing) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}
