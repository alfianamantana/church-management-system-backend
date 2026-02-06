import { Request, Response } from 'express';
import { Transaction, Category } from '../model';
import Validator from 'validatorjs';
import { Op } from 'sequelize';

export const TransactionController = {
  // Get all transactions with pagination and search
  async getTransactions(req: Request, res: Response) {
    try {
      let { page = 1, limit = 10, q } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (q) {
        whereClause = {
          [Op.or]: [
            { '$category.name$': { [Op.iLike]: `%${q}%` } },
            { note: { [Op.iLike]: `%${q}%` } },
          ],
        };
      }

      const { count, rows } = await Transaction.findAndCountAll({
        offset,
        limit,
        where: whereClause,
        include: [{ model: Category, as: 'category' }],
        order: [
          ['date', 'DESC'],
          ['id', 'DESC'],
        ],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: rows,
        pagination: { total: count, page },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
        error: err,
      });
    }
  },

  // Create a new transaction
  async createTransaction(req: Request, res: Response) {
    try {
      const { date, category_id, amount, note } = req.body;

      const rules = {
        date: 'required|date',
        category_id: 'required|numeric',
        amount: 'required|numeric|min:0',
        note: 'string',
      };

      const validation = new Validator(
        { date, category_id, amount, note },
        rules,
      );
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      // Check if category exists
      const category = await Category.findOne({ where: { id: category_id } });
      if (!category) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Category not found'],
        });
      }

      await Transaction.create({ date, category_id, amount, note });

      return res.json({
        code: 201,
        status: 'success',
        message: ['Transaction created successfully'],
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
        error: err,
      });
    }
  },

  // Update a transaction
  async updateTransaction(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const { date, category_id, amount, note } = req.body;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const transaction = await Transaction.findOne({
        where: { id: Number(id) },
      });
      if (!transaction) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Transaction not found'],
        });
      }

      if (date) transaction.date = date;
      if (category_id) {
        const category = await Category.findOne({ where: { id: category_id } });
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
        message: ['Transaction updated successfully'],
        data: transaction,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
        error: err,
      });
    }
  },

  // Delete a transaction
  async deleteTransaction(req: Request, res: Response) {
    try {
      const { id } = req.query;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const transaction = await Transaction.findOne({
        where: { id: Number(id) },
      });
      if (!transaction) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Transaction not found'],
        });
      }

      await transaction.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: ['Transaction deleted successfully'],
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
        error: err,
      });
    }
  },
};
