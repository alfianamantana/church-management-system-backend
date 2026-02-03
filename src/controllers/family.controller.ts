import { Request, Response } from 'express';
import { Family, Jemaat } from '../model';
import Validator from 'validatorjs';
import { Op } from 'sequelize';

export const FamilyController = {
  // Get all families with pagination and search
  async getFamilies(req: Request, res: Response) {
    try {
      let { page = 1, limit = 10, q, id } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause = {};

      if (id) {
        whereClause = { id: Number(id) };
      }

      if (q) {
        whereClause = {
          name: { [Op.iLike]: `%${q}%` },
        };
      }

      const { count, rows } = await Family.findAndCountAll({
        offset,
        limit,
        where: whereClause,
        include: [{ model: Jemaat, as: 'jemaats' }],
        order: [['name', 'ASC']],
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

  // Create a new family
  async createFamily(req: Request, res: Response) {
    try {
      const { name } = req.body;

      const validator = new Validator(req.body, {
        name: 'required|string|max:255',
      });

      if (validator.fails()) {
        return res.json({
          code: 400,
          status: 'error',
          message: Object.values(validator.errors.all()).flat(),
        });
      }

      const family = await Family.create({ name });

      return res.json({
        code: 201,
        status: 'success',
        data: family,
        message: ['Family created successfully'],
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

  // Update a family
  async updateFamily(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const { name } = req.body;

      const validator = new Validator(req.body, {
        name: 'required|string|max:255',
      });

      if (validator.fails()) {
        return res.json({
          code: 400,
          status: 'error',
          message: Object.values(validator.errors.all()).flat(),
        });
      }

      const family = await Family.findOne({ where: { id: Number(id) } });
      if (!family) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Family not found'],
        });
      }

      await family.update({ name });

      return res.json({
        code: 200,
        status: 'success',
        data: family,
        message: ['Family updated successfully'],
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

  // Delete a family
  async deleteFamily(req: Request, res: Response) {
    try {
      const { id } = req.query;

      const family = await Family.findOne({ where: { id: Number(id) } });
      if (!family) {
        return res.json({
          code: 404,
          status: 'error',
          message: ['Family not found'],
        });
      }

      await family.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: ['Family deleted successfully'],
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
