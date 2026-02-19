import { Request, Response } from 'express';
import { Family, Congregation, Church, UserChurch } from '../model';
import { getValidationRules, validateField } from '../helpers';
import { Op, where, fn } from 'sequelize';
import sequelize from '../../config/db.config';

export const FamilyController = {
  async get(req: Request, res: Response) {
    try {
      const { page, limit, q, id } = req.query as {
        page?: string;
        limit?: string;
        q?: string;
        id?: string;
        member?: boolean | string;
      };

      const member = req.query.member === 'true';
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      let includeClause = [];

      if (member) {
        const attributes: (string | [any, string])[] = [
          ...Object.keys(Congregation.rawAttributes),
          [
            fn('EXTRACT', sequelize.literal('YEAR FROM AGE(birth_date)')),
            'age',
          ],
        ];
        includeClause.push({
          model: Congregation,
          as: 'congregations',
          attributes,
        });
      }

      // Get church for the user
      const userChurch = await UserChurch.findOne({
        where: { user_id: req.user?.id },
        include: [{ model: Church, as: 'church' }],
      });
      if (!userChurch || !userChurch.church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }
      const church = userChurch.church;

      let whereClause: any = { church_id: church.id }; // Add church filter

      if (id) {
        whereClause = { ...whereClause, id: id };
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
  async create(req: Request, res: Response) {
    try {
      const { name, congregation_ids } = req.body as {
        name: string;
        congregation_ids?: string[];
      };

      // Validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate name
      const nameErrors = validateField(name, validationRules.name);
      if (nameErrors.id) errorsId.push(nameErrors.id);
      if (nameErrors.en) errorsEn.push(nameErrors.en);

      // Validate congregation_ids (required)
      if (
        !congregation_ids ||
        !Array.isArray(congregation_ids) ||
        congregation_ids.length === 0
      ) {
        errorsId.push('Pilih setidaknya satu jemaat untuk keluarga');
        errorsEn.push('Select at least one congregation for the family');
      } else {
        for (const id of congregation_ids) {
          if (typeof id !== 'string') {
            errorsId.push('ID jemaat harus berupa string');
            errorsEn.push('Congregation ID must be a string');
            break;
          }
        }
      }

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

      // Get church for the user
      const userChurch = await UserChurch.findOne({
        where: { user_id: req.user?.id },
        include: [{ model: Church, as: 'church' }],
      });
      if (!userChurch || !userChurch.church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }
      const church = userChurch.church;

      const family = await Family.create({ name, church_id: church.id });

      // Update congregation family_id
      if (congregation_ids && congregation_ids.length > 0) {
        await Congregation.update(
          { family_id: family.id },
          { where: { id: congregation_ids, church_id: church.id } }, // Add church filter
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
      });
    }
  },

  // Update a family
  async update(req: Request, res: Response) {
    try {
      const id = req.query.id as string;
      const { name, congregation_ids } = req.body as {
        name: string;
        congregation_ids?: string[];
      };

      // Validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate name
      const nameErrors = validateField(name, validationRules.name);
      if (nameErrors.id) errorsId.push(nameErrors.id);
      if (nameErrors.en) errorsEn.push(nameErrors.en);

      // Validate congregation_ids (required)
      if (
        !congregation_ids ||
        !Array.isArray(congregation_ids) ||
        congregation_ids.length === 0
      ) {
        errorsId.push('Pilih setidaknya satu jemaat untuk keluarga');
        errorsEn.push('Select at least one congregation for the family');
      } else {
        for (const id of congregation_ids) {
          if (typeof id !== 'string') {
            errorsId.push('ID jemaat harus berupa string');
            errorsEn.push('Congregation ID must be a string');
            break;
          }
        }
      }

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

      // Get church for the user
      const userChurch = await UserChurch.findOne({
        where: { user_id: req.user?.id },
        include: [{ model: Church, as: 'church' }],
      });
      if (!userChurch || !userChurch.church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }
      const church = userChurch.church;

      const family = await Family.findOne({
        where: { id: Number(id), church_id: church.id },
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

      // Handle congregation updates
      if (congregation_ids !== undefined) {
        const currentCongregation = await Congregation.findAll({
          where: { family_id: family.id, church_id: church.id }, // Add church filter
        });
        const currentIds: string[] = currentCongregation.map((j) => j.id);
        const selectedIds: string[] = congregation_ids || [];

        const toAdd = selectedIds.filter((id) => !currentIds.includes(id));
        const toRemove = currentIds.filter((id) => !selectedIds.includes(id));

        if (toAdd.length > 0) {
          await Congregation.update(
            { family_id: family.id },
            { where: { id: toAdd, church_id: church.id } }, // Add church filter
          );
        }

        if (toRemove.length > 0) {
          await Congregation.update(
            { family_id: null },
            { where: { id: toRemove, church_id: church.id } },
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
  async destroy(req: Request, res: Response) {
    try {
      const id = req.query.id as string;

      // Get church for the user
      const userChurch = await UserChurch.findOne({
        where: { user_id: req.user?.id },
        include: [{ model: Church, as: 'church' }],
      });
      if (!userChurch || !userChurch.church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }
      const church = userChurch.church;

      const family = await Family.findOne({
        where: { id: id, church_id: church.id },
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
