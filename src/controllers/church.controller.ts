import { Request, Response } from 'express';
import Validator from 'validatorjs';
import { Church, User } from '../model';

export const ChurchController = {
  async get(req: Request, res: Response) {
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
    const { user } = req as Express.Request;
    try {
      // Check church count limit based on subscribe_type
      if (
        user?.subscribe_type === 'bibit' ||
        user?.subscribe_type === 'bertumbuh'
      ) {
        const churchCount = await Church.count({
          where: { user_id: user?.id },
        });
        if (user?.subscribe_type === 'bibit' && churchCount >= 1) {
          return res.json({
            code: 403,
            status: 'error',
            message: {
              id: ['Akun bibit hanya dapat membuat 1 gereja'],
              en: ['Bibit plan can only create 1 church'],
            },
          });
        }
        if (user?.subscribe_type === 'bertumbuh' && churchCount >= 2) {
          return res.json({
            code: 403,
            status: 'error',
            message: {
              id: ['Akun bertumbuh hanya dapat membuat maksimal 2 gereja'],
              en: ['Bertumbuh plan can only create up to 2 churches'],
            },
          });
        }
      }
      const validation = new Validator(req.body, {
        name: 'required|string',
        email: 'required|email',
        city: 'required|string',
        country: 'required|string',
        phone_number: 'required|string',
      });

      if (validation.fails()) {
        return res.json({
          code: 422,
          status: 'error',
          message: {
            id: ['Validasi gagal'],
            en: ['Validation failed'],
          },
        });
      }

      await Church.create({ ...req.body, user_id: user?.id });

      const newuser = await User.findOne({
        where: { id: user?.id },
        include: [Church],
      });

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Gereja berhasil dibuat'],
          en: ['Church created successfully'],
        },
        data: newuser,
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
  async update(req: Request, res: Response) {
    try {
      const { church } = req as Express.Request;
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
        });
      }

      await Church.update(req.body, { where: { id: church?.id } });
      return res.json({
        code: 200,
        status: 'success',
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
};
