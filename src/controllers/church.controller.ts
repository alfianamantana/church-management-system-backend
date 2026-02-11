import { Request, Response } from 'express';
import Validator from 'validatorjs';
import { Church } from '../model';

export const ChurchController = {
  async getAll(req: Request, res: Response) {
    try {
      const churches = await Church.findAll();
      return res.json({
        code: 200,
        status: 'success',
        data: churches,
        message: {
          id: ['Data gereja berhasil diambil'],
          en: ['Church data retrieved successfully'],
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

  async create(req: Request, res: Response) {
    try {
      const validation = new Validator(req.body, {
        name: 'required|string',
        email: 'required|email',
        city: 'required|string',
        country: 'required|string',
        phone_number: 'required|string',
        user_id: 'required|integer',
      });

      if (validation.fails()) {
        return res.json({
          code: 422,
          status: 'error',
          message: {
            id: ['Validasi gagal'],
            en: ['Validation failed'],
          },
          errors: validation.errors.all(),
        });
      }

      const church = await Church.create(req.body);
      return res.json({
        code: 201,
        status: 'success',
        data: church,
        message: {
          id: ['Gereja berhasil dibuat'],
          en: ['Church created successfully'],
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

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const churchId = parseInt(id as string, 10);
      const validation = new Validator(req.body, {
        name: 'string',
        email: 'email',
        city: 'string',
        country: 'string',
        phone_number: 'string',
        user_id: 'integer',
      });

      if (validation.fails()) {
        return res.json({
          code: 422,
          status: 'error',
          message: {
            id: ['Validasi gagal'],
            en: ['Validation failed'],
          },
          errors: validation.errors.all(),
        });
      }

      const church = await Church.findByPk(churchId);
      if (!church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }

      await church.update(req.body);
      return res.json({
        code: 200,
        status: 'success',
        data: church,
        message: {
          id: ['Gereja berhasil diperbarui'],
          en: ['Church updated successfully'],
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

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const churchId = parseInt(id as string, 10);
      const church = await Church.findByPk(churchId);
      if (!church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }

      await church.destroy();
      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Gereja berhasil dihapus'],
          en: ['Church deleted successfully'],
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
};
