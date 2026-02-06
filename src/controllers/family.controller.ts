import { Request, Response } from 'express';
import { Family, Jemaat } from '../model';
import Validator from 'validatorjs';
import { Op, where, fn } from 'sequelize';
import sequelize from '../../config/db.config';

export const FamilyController = {
  async getFamilies(req: Request, res: Response) {
    try {
      const { page, limit, q, id } = req.query as {
        page?: string;
        limit?: string;
        q?: string;
        id?: string;
        member?: boolean | string;
      };
      const member = req.query.member === 'true' ? true : false;
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      let includeClause = [];

      if (member) {
        const attributes: (string | [any, string])[] = [
          ...Object.keys(Jemaat.rawAttributes),
          [
            fn('EXTRACT', sequelize.literal('YEAR FROM AGE(birth_date)')),
            'age',
          ],
        ];
        includeClause.push({
          model: Jemaat,
          as: 'jemaats',
          attributes,
        });
      }

      let whereClause: any = { user_id: req.user?.id }; // Add user filter

      if (id) {
        whereClause = { ...whereClause, id: Number(id) };
      }

      if (q) {
        whereClause = {
          ...whereClause,
          name: { [Op.iLike]: `%${q}%` },
        };
      }

      const { count, rows } = await Family.findAndCountAll({
        offset,
        limit: limitNum,
        where: whereClause,
        include: includeClause,
        order: [['name', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: rows,
        pagination: { total: count, page: pageNum, limit: limitNum },
        message: {
          id: ['Keluarga berhasil diambil'],
          en: ['Families retrieved successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  // Create a new family
  async createFamily(req: Request, res: Response) {
    try {
      const { name, jemaat_ids } = req.body as {
        name: string;
        jemaat_ids?: number[];
      };

      const validator = new Validator(req.body, {
        name: 'required|string|max:255',
        jemaat_ids: 'array',
        'jemaat_ids.*': 'integer',
      });

      if (validator.fails()) {
        return res.json({
          code: 400,
          status: 'error',
          message: Object.values(validator.errors.all()).flat(),
        });
      }

      const family = await Family.create({ name, user_id: req.user?.id });

      // Update jemaat family_id
      if (jemaat_ids && jemaat_ids.length > 0) {
        await Jemaat.update(
          { family_id: family.id },
          { where: { id: jemaat_ids, user_id: req.user?.id } }, // Add user filter
        );
      }

      return res.json({
        code: 201,
        status: 'success',
        data: family,
        message: {
          id: ['Keluarga berhasil dibuat'],
          en: ['Family created successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  // Update a family
  async updateFamily(req: Request, res: Response) {
    try {
      const id = req.query.id as string;
      const { name, jemaat_ids } = req.body as {
        name: string;
        jemaat_ids?: number[];
      };

      const validator = new Validator(req.body, {
        name: 'required|string|max:255',
        jemaat_ids: 'array',
        'jemaat_ids.*': 'integer',
      });

      if (validator.fails()) {
        return res.json({
          code: 400,
          status: 'error',
          message: Object.values(validator.errors.all()).flat(),
        });
      }

      const family = await Family.findOne({
        where: { id: Number(id), user_id: req.user?.id },
      });
      if (!family) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Keluarga tidak ditemukan'],
            en: ['Family not found'],
          },
        });
      }

      await family.update({ name });

      // Handle jemaat updates
      if (jemaat_ids !== undefined) {
        const currentJemaat = await Jemaat.findAll({
          where: { family_id: family.id, user_id: req.user?.id }, // Add user filter
        });
        const currentIds = currentJemaat.map((j) => j.id);
        const selectedIds = jemaat_ids || [];

        const toAdd = selectedIds.filter((id) => !currentIds.includes(id));
        const toRemove = currentIds.filter((id) => !selectedIds.includes(id));

        if (toAdd.length > 0) {
          await Jemaat.update(
            { family_id: family.id },
            { where: { id: toAdd, user_id: req.user?.id } }, // Add user filter
          );
        }

        if (toRemove.length > 0) {
          await Jemaat.update(
            { family_id: null },
            { where: { id: toRemove, user_id: req.user?.id } },
          ); // Add user filter
        }
      }

      return res.json({
        code: 200,
        status: 'success',
        data: family,
        message: {
          id: ['Keluarga berhasil diperbarui'],
          en: ['Family updated successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  // Delete a family
  async deleteFamily(req: Request, res: Response) {
    try {
      const id = req.query.id as string;

      const family = await Family.findOne({
        where: { id: Number(id), user_id: req.user?.id },
      });
      if (!family) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Keluarga tidak ditemukan'],
            en: ['Family not found'],
          },
        });
      }

      await family.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Keluarga berhasil dihapus'],
          en: ['Family deleted successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },
};
