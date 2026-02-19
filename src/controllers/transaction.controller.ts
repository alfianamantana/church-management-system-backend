import { Request, Response } from 'express';
import { Transaction, Category, Church } from '../model';
import { Op } from 'sequelize';
import { getValidationRules, validateField } from '../helpers';

export const TransactionController = {
  // Get all transactions with pagination and search
  async get(req: Request, res: Response) {
    try {
      const { church } = req;
      const { page = 1, limit = 10, q, id } = req.query;

      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const whereClause: any = { church_id: church?.id };

      if (id) {
        whereClause.id = id;
      }

      if (q) {
        whereClause[Op.or] = [
          { '$category.name$': { [Op.iLike]: `%${q}%` } },
          { note: { [Op.iLike]: `%${q}%` } },
        ];
      }

      const { count, rows } = await Transaction.findAndCountAll({
        where: whereClause,
        include: [{ model: Category, as: 'category' }],
        order: [
          ['date', 'DESC'],
          ['id', 'DESC'],
        ],
        offset,
        limit: limitNum,
      });

      return res.json({
        code: 200,
        status: 'success',
        data: rows,
        pagination: { total: count, page: pageNum },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  // Create a new transaction
  async create(req: Request, res: Response) {
    try {
      const { church } = req;
      const { date, category_id, amount, note } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate each field
      const fields = {
        date: { value: date, rules: validationRules.date },
        category_id: { value: category_id, rules: validationRules.category_id },
        amount: { value: amount, rules: validationRules.amount },
        note: { value: note, rules: validationRules.note },
      };

      Object.entries(fields).forEach(([fieldName, config]) => {
        const errors = validateField(config.value, config.rules);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      });

      // If there are validation errors, return them
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

      // Check if category exists
      const category = await Category.findOne({
        where: { id: category_id },
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

      await Transaction.create({
        church_id: church?.id,
        date,
        category_id,
        amount,
        note,
      });

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Transaksi berhasil dibuat'],
          en: ['Transaction created successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },

  // Update a transaction
  async update(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;
      const { date, category_id, amount, note } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate id
      const idErrors = validateField(id, validationRules.id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

      // Validate optional fields
      const fields: { [key: string]: { value: any; rules: any } } = {};
      if (date !== undefined)
        fields.date = { value: date, rules: validationRules.date };
      if (category_id !== undefined)
        fields.category_id = {
          value: category_id,
          rules: validationRules.category_id,
        };
      if (amount !== undefined)
        fields.amount = { value: amount, rules: validationRules.amount };
      if (note !== undefined)
        fields.note = { value: note, rules: validationRules.note };

      Object.entries(fields).forEach(([fieldName, config]) => {
        const errors = validateField(config.value, config.rules);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      });

      // If there are validation errors, return them
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

      const transaction = await Transaction.findOne({
        where: { id, church_id: church?.id },
      });
      if (!transaction) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Transaksi tidak ditemukan'],
            en: ['Transaction not found'],
          },
        });
      }

      if (date) transaction.date = date;
      if (category_id) {
        const category = await Category.findOne({
          where: { id: category_id },
        });
        if (!category) {
          return res.json({
            code: 404,
            status: 'error',
            message: ['Category not found'],
          });
        }
        transaction.category_id = category_id;
      }
      if (amount !== undefined) transaction.amount = amount;
      if (note !== undefined) transaction.note = note;

      await transaction.save();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Transaksi berhasil diperbarui'],
          en: ['Transaction updated successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  // Delete a transaction
  async destroy(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate id
      const idErrors = validateField(id, validationRules.id);
      if (idErrors.id) errorsId.push(idErrors.id);
      if (idErrors.en) errorsEn.push(idErrors.en);

      // If there are validation errors, return them
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

      const transaction = await Transaction.findOne({
        where: { id, church_id: church?.id },
      });
      if (!transaction) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Transaksi tidak ditemukan'],
            en: ['Transaction not found'],
          },
        });
      }

      await transaction.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Transaksi berhasil dihapus'],
          en: ['Transaction deleted successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },
};
