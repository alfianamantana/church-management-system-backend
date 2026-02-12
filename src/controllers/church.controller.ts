import { Request, Response } from 'express';
import Validator from 'validatorjs';
import { Church, User } from '../model';

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
      let user = req.user;

      // Fetch user from DB to get subscribe_type
      const dbUser = await User.findByPk(user?.id);
      if (!dbUser) {
        return res.json({
          code: 401,
          status: 'error',
          message: {
            id: ['User tidak ditemukan'],
            en: ['User not found'],
          },
        });
      }

      // Check church count limit based on subscribe_type
      if (
        dbUser.subscribe_type === 'bibit' ||
        dbUser.subscribe_type === 'bertumbuh'
      ) {
        const churchCount = await Church.count({
          where: { user_id: dbUser.id },
        });
        if (dbUser.subscribe_type === 'bibit' && churchCount >= 1) {
          return res.json({
            code: 403,
            status: 'error',
            message: {
              id: ['Akun bibit hanya dapat membuat 1 gereja'],
              en: ['Bibit plan can only create 1 church'],
            },
          });
        }
        if (dbUser.subscribe_type === 'bertumbuh' && churchCount >= 2) {
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
