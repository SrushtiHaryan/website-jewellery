import { Collection, ICollection } from '../models/Collection';
import { Product } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { generateUniqueSlug } from '../utils/slug';

export const collectionService = {
  async create(data: Record<string, unknown>): Promise<ICollection> {
    const slug = await generateUniqueSlug(
      Collection,
      (data.slug as string) || (data.name as string)
    );
    return Collection.create({ ...data, slug });
  },

  async update(id: string, data: Record<string, unknown>): Promise<ICollection> {
    const collection = await Collection.findById(id);
    if (!collection) throw ApiError.notFound('Collection not found.');
    if (data.slug || (data.name && data.name !== collection.name)) {
      collection.slug = await generateUniqueSlug(
        Collection,
        (data.slug as string) || (data.name as string),
        id
      );
    }
    Object.assign(collection, data);
    await collection.save();
    return collection;
  },

  async remove(id: string): Promise<void> {
    // Pull the collection reference from any products, then delete.
    await Product.updateMany({ collections: id }, { $pull: { collections: id } });
    const result = await Collection.findByIdAndDelete(id);
    if (!result) throw ApiError.notFound('Collection not found.');
  },

  async setProducts(id: string, productIds: string[]): Promise<void> {
    const collection = await Collection.findById(id).select('_id');
    if (!collection) throw ApiError.notFound('Collection not found.');
    // Remove this collection from all products, then add to the selected set.
    await Product.updateMany({ collections: id }, { $pull: { collections: id } });
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $addToSet: { collections: id } }
    );
  },
};
