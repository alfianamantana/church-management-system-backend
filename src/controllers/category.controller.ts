import { Request, Response } from 'express';
import { Category, Church, Transaction } from '../model';
import { Op } from 'sequelize';
import { validateField, getValidationRules } from '../helpers';

export const CategoryController = {
  // Get all categories for the church
  async get(req: Request, res: Response) {
    try {
      const { church } = req;
      let { page = 1, limit = 10, q } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause: any = {
        church_id: church?.id,
      };

      if (q) {
        whereClause.name = { [Op.iLike]: `%${q}%` };
      }

      const { count, rows } = await Category.findAndCountAll({
        where: whereClause,
        offset,
        limit,
        order: [['created_at', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: rows,
        pagination: { total: count, page, limit },
      });
    } catch (error) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: error,
      });
    }
  },

  // Create a new category
  async create(req: Request, res: Response) {
    try {
      const { church } = req;
      const { name, type } = req.body;

      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate name
      const nameErrors = validateField(name, validationRules.category_name);
      if (nameErrors.id) errorsId.push(nameErrors.id);
      if (nameErrors.en) errorsEn.push(nameErrors.en);

      // Validate type
      const typeErrors = validateField(type, validationRules.category_type);
      if (typeErrors.id) errorsId.push(typeErrors.id);
      if (typeErrors.en) errorsEn.push(typeErrors.en);

      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

      // Check if category name already exists for this church
      const existingCategory = await Category.findOne({
        where: {
          church_id: church?.id,
          name: name.trim(),
        },
      });

      if (existingCategory) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Nama kategori sudah ada'],
            en: ['Category name already exists'],
          },
        });
      }

      const newCategory = await Category.create({
        church_id: church?.id,
        name: name.trim(),
        type,
      });

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Kategori berhasil dibuat'],
          en: ['Category created successfully'],
        },
        data: newCategory,
      });
    } catch (error) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: error,
      });
    }
  },

  // Update a category
  async update(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;
      const { name, type } = req.body;

      if (!id || typeof id !== 'string') {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['ID tidak valid'],
            en: ['Invalid ID'],
          },
        });
      }

      const category = await Category.findOne({
        where: {
          id,
          church_id: church?.id,
        },
      });

      if (!category) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Kategori tidak ditemukan'],
            en: ['Category not found'],
          },
        });
      }

      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate name
      const nameErrors = validateField(name, validationRules.category_name);
      if (nameErrors.id) errorsId.push(nameErrors.id);
      if (nameErrors.en) errorsEn.push(nameErrors.en);

      // Validate type
      const typeErrors = validateField(type, validationRules.category_type);
      if (typeErrors.id) errorsId.push(typeErrors.id);
      if (typeErrors.en) errorsEn.push(typeErrors.en);

      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

      // Check if category name already exists for this church (excluding current)
      const existingCategory = await Category.findOne({
        where: {
          church_id: church?.id,
          name: name.trim(),
          id: { [Op.ne]: id },
        },
      });

      if (existingCategory) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Nama kategori sudah ada'],
            en: ['Category name already exists'],
          },
        });
      }

      await category.update({
        name: name.trim(),
        type,
      });

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Kategori berhasil diperbarui'],
          en: ['Category updated successfully'],
        },
        data: category,
      });
    } catch (error) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: error,
      });
    }
  },

  // Delete a category
  async destroy(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['ID tidak valid'],
            en: ['Invalid ID'],
          },
        });
      }

      const category = await Category.findOne({
        where: {
          id,
          church_id: church?.id,
        },
        include: [{ model: Transaction, as: 'transactions' }],
      });

      if (!category) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Kategori tidak ditemukan'],
            en: ['Category not found'],
          },
        });
      }

      // Check if category has transactions
      if (category.transactions && category.transactions.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: [
              'Kategori tidak dapat dihapus karena masih memiliki transaksi',
            ],
            en: ['Category cannot be deleted because it has transactions'],
          },
        });
      }

      await category.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Kategori berhasil dihapus'],
          en: ['Category deleted successfully'],
        },
      });
    } catch (error) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: error,
      });
    }
  },
};
