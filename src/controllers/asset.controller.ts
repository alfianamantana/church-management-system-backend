import { Request, Response } from 'express';
import { Asset, Church } from '../model';
import { Op } from 'sequelize';
import { validateField, getValidationRules } from '../helpers';

export const AssetController = {
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
        whereClause = {
          ...whereClause,
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { description: { [Op.iLike]: `%${q}%` } },
            { category: { [Op.iLike]: `%${q}%` } },
            { location: { [Op.iLike]: `%${q}%` } },
          ],
        };
      }

      const { count, rows } = await Asset.findAndCountAll({
        offset,
        limit,
        where: whereClause,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
      });

      res.json({
        code: 200,
        status: 'success',
        data: rows,
        message: {
          id: ['Data Aset berhasil diambil'],
          en: ['Assets retrieved successfully'],
        },
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.log(error, 'asdaS?');

      res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error,
      });
    }
  },
  async create(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        value,
        acquisition_date,
        condition,
        location,
        category,
        notes,
      } = req.body;
      const { church } = req;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate each field
      const fields: any = {
        name: { value: name, rules: validationRules.asset_name },
      };

      // Optional validations
      if (value !== undefined) {
        fields.value = { value, rules: validationRules.asset_value };
      }
      if (acquisition_date !== undefined) {
        fields.acquisition_date = {
          value: acquisition_date,
          rules: validationRules.acquisition_date,
        };
      }
      if (condition !== undefined) {
        fields.condition = {
          value: condition,
          rules: validationRules.asset_condition,
        };
      }
      if (location !== undefined) {
        fields.location = {
          value: location,
          rules: validationRules.asset_location,
        };
      }
      if (category !== undefined) {
        fields.category = {
          value: category,
          rules: validationRules.asset_category,
        };
      }
      if (description !== undefined) {
        fields.description = {
          value: description,
          rules: validationRules.asset_description,
        };
      }
      if (notes !== undefined) {
        fields.notes = { value: notes, rules: validationRules.asset_notes };
      }

      Object.entries(fields).forEach(([fieldName, config]) => {
        const errors = validateField(
          (config as any).value,
          (config as any).rules,
        );
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

      await Asset.create({
        church_id: church?.id,
        name,
        description,
        value,
        acquisition_date,
        condition,
        location,
        category,
        notes,
      });

      res.json({
        code: 201,
        message: {
          id: ['Aset berhasil dibuat'],
          en: ['Asset created successfully'],
        },
      });
    } catch (error) {
      console.error('Error creating asset:', error);
      res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
      });
    }
  },
  async update(req: Request, res: Response) {
    try {
      const { church } = req;
      const id = req.query.id;
      if (!id) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['ID aset tidak valid'],
            en: ['Invalid asset ID'],
          },
        });
      }
      const {
        name,
        description,
        value,
        acquisition_date,
        condition,
        location,
        category,
        notes,
      } = req.body;

      // Simplified validation for optional fields
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate optional fields only if provided
      if (name !== undefined) {
        const errors = validateField(name, validationRules.asset_name);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (value !== undefined) {
        const errors = validateField(value, validationRules.asset_value);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (acquisition_date !== undefined) {
        const errors = validateField(
          acquisition_date,
          validationRules.acquisition_date,
        );
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (condition !== undefined) {
        const errors = validateField(
          condition,
          validationRules.asset_condition,
        );
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (location !== undefined) {
        const errors = validateField(location, validationRules.asset_location);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (category !== undefined) {
        const errors = validateField(category, validationRules.asset_category);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (description !== undefined) {
        const errors = validateField(
          description,
          validationRules.asset_description,
        );
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (notes !== undefined) {
        const errors = validateField(notes, validationRules.asset_notes);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
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

      const asset = await Asset.findOne({ where: { id } });

      if (!asset || asset.church_id !== church?.id) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Aset tidak ditemukan'],
            en: ['Asset not found'],
          },
        });
      }

      await asset.update({
        name,
        description,
        value,
        acquisition_date,
        condition,
        location,
        category,
        notes,
      });

      res.json({
        code: 200,
        message: {
          id: ['Aset berhasil diperbarui'],
          en: ['Asset updated successfully'],
        },
        data: asset,
      });
    } catch (error) {
      res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error,
      });
    }
  },
  async destroy(req: Request, res: Response) {
    try {
      const { church } = req;
      const id = req.query.id;
      if (!id) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['ID aset tidak valid'],
            en: ['Invalid asset ID'],
          },
        });
      }

      const asset = await Asset.findOne({ where: { id } });

      if (!asset || asset.church_id !== church?.id) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Aset tidak ditemukan'],
            en: ['Asset not found'],
          },
        });
      }

      await asset.destroy();

      res.json({
        code: 200,
        message: {
          id: ['Aset berhasil dihapus'],
          en: ['Asset deleted successfully'],
        },
      });
    } catch (error) {
      res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
      });
    }
  },
};
