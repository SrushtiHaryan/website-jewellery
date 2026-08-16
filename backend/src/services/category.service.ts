import { Category, ICategory } from '../models/Category';
import { Product } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { generateUniqueSlug } from '../utils/slug';

export const categoryService = {
  async create(data: Record<string, unknown>): Promise<ICategory> {
    const slug = await generateUniqueSlug(
      Category,
      (data.slug as string) || (data.name as string)
    );
    return Category.create({ ...data, slug });
  },

  async update(id: string, data: Record<string, unknown>): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) throw ApiError.notFound('Category not found.');
    if (data.slug || (data.name && data.name !== category.name)) {
      category.slug = await generateUniqueSlug(
        Category,
        (data.slug as string) || (data.name as string),
        id
      );
    }
    Object.assign(category, data);
    await category.save();
    return category;
  },

  async remove(id: string): Promise<void> {
    const inUse = await Product.exists({ $or: [{ category: id }, { subcategory: id }] });
    if (inUse) {
      throw ApiError.conflict('Cannot delete a category that still has products.');
    }
    const result = await Category.findByIdAndDelete(id);
    if (!result) throw ApiError.notFound('Category not found.');
  },
};
