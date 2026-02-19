import { Request, Response } from 'express';
import { Coupon } from '../model';
import { Op } from 'sequelize';

export const CouponController = {
  async create(req: Request, res: Response) {
    try {
      const { code, type, value, is_active, expired_at } = req.body;

      // Simple validation
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        errorsId.push('Kode kupon wajib diisi');
        errorsEn.push('Coupon code is required');
      }

      if (
        !type ||
        !['discount_percentage', 'discount_fixed', 'add_duration'].includes(
          type,
        )
      ) {
        errorsId.push(
          'Tipe kupon harus salah satu dari: discount_percentage, discount_fixed, add_duration',
        );
        errorsEn.push(
          'Coupon type must be one of: discount_percentage, discount_fixed, add_duration',
        );
      }

      // Validate value based on type
      if (type === 'discount_percentage' || type === 'discount_fixed') {
        if (
          value === undefined ||
          value === null ||
          typeof value !== 'number' ||
          value < 0
        ) {
          errorsId.push('Nilai kupon wajib diisi dan harus >= 0');
          errorsEn.push('Coupon value is required and must be >= 0');
        }
      } else if (type === 'add_duration') {
        if (
          value === undefined ||
          value === null ||
          typeof value !== 'number' ||
          value < 1
        ) {
          errorsId.push('Durasi tambahan kupon wajib diisi dan harus >= 1');
          errorsEn.push('Additional duration is required and must be >= 1');
        }
      }

      // Check if coupon code already exists
      if (code && !errorsId.length) {
        const existingCoupon = await Coupon.findOne({
          where: { code: code.toUpperCase() },
        });
        if (existingCoupon) {
          errorsId.push('Kode kupon sudah digunakan');
          errorsEn.push('Coupon code already exists');
        }
      }

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

      const couponData: any = {
        code: code.toUpperCase(),
        type,
        is_active: is_active !== undefined ? is_active : true,
      };

      if (value !== undefined) {
        couponData.value = value;
      }

      if (expired_at) {
        couponData.expired_at = new Date(expired_at);
      }

      const coupon = await Coupon.create(couponData);

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Kupon berhasil dibuat'],
          en: ['Coupon created successfully'],
        },
        data: coupon,
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

  async get(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        type,
        is_active,
        sort_by = 'created_at',
        sort_order = 'DESC',
        code,
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const where: any = {};

      // Search filter
      if (search) {
        where[Op.or] = [{ code: { [Op.iLike]: `%${search}%` } }];
      }

      // Type filter
      if (type) {
        where.type = type;
      }

      // Active status filter
      if (is_active !== undefined) {
        where.is_active = is_active === 'true';
      }

      const { count, rows } = await Coupon.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [[sort_by as string, sort_order as any]],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: {
          coupons: rows,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            total_pages: Math.ceil(count / Number(limit)),
          },
        },
        message: {
          id: ['Data kupon berhasil diambil'],
          en: ['Coupon data retrieved successfully'],
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
      const couponId = Array.isArray(id) ? id[0] : id;
      const { code, type, value, is_active, expired_at } = req.body;

      const coupon = await Coupon.findByPk(couponId);

      if (!coupon) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Kupon tidak ditemukan'],
            en: ['Coupon not found'],
          },
        });
      }

      // Simple validation
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      if (
        !type ||
        !['discount_percentage', 'discount_fixed', 'add_duration'].includes(
          type,
        )
      ) {
        errorsId.push(
          'Tipe kupon harus salah satu dari: discount_percentage, discount_fixed, add_duration',
        );
        errorsEn.push(
          'Coupon type must be one of: discount_percentage, discount_fixed, add_duration',
        );
      }

      // Validate value based on type
      if (type === 'discount_percentage' || type === 'discount_fixed') {
        if (
          value === undefined ||
          value === null ||
          typeof value !== 'number' ||
          value < 0
        ) {
          errorsId.push('Nilai kupon wajib diisi dan harus >= 0');
          errorsEn.push('Coupon value is required and must be >= 0');
        }
      } else if (type === 'add_duration') {
        if (
          value === undefined ||
          value === null ||
          typeof value !== 'number' ||
          value < 1
        ) {
          errorsId.push('Durasi tambahan kupon wajib diisi dan harus >= 1');
          errorsEn.push('Additional duration is required and must be >= 1');
        }
      }

      // Check if coupon code already exists (excluding current coupon)
      if (code && code.toUpperCase() !== coupon.code) {
        const existingCoupon = await Coupon.findOne({
          where: {
            code: code.toUpperCase(),
            id: { [Op.ne]: id },
          },
        });
        if (existingCoupon) {
          errorsId.push('Kode kupon sudah digunakan');
          errorsEn.push('Coupon code already exists');
        }
      }

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

      const updateData: any = {
        type,
        is_active: is_active !== undefined ? is_active : coupon.is_active,
      };

      if (code) {
        updateData.code = code.toUpperCase();
      }

      if (value !== undefined) {
        updateData.value = value;
      }

      if (expired_at !== undefined) {
        updateData.expired_at = expired_at ? new Date(expired_at) : null;
      }

      await coupon.update(updateData);

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Kupon berhasil diperbarui'],
          en: ['Coupon updated successfully'],
        },
        data: coupon,
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
      const couponId = Array.isArray(id) ? id[0] : id;

      const coupon = await Coupon.findByPk(couponId);

      if (!coupon) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Kupon tidak ditemukan'],
            en: ['Coupon not found'],
          },
        });
      }

      // Check if coupon is being used by any subscriptions
      const usageCount = await coupon.$count('churchSubscriptions');

      if (usageCount > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Kupon tidak dapat dihapus karena sedang digunakan'],
            en: ['Coupon cannot be deleted because it is currently in use'],
          },
        });
      }

      await coupon.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Kupon berhasil dihapus'],
          en: ['Coupon deleted successfully'],
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

  async validate(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const couponCode = Array.isArray(code) ? code[0] : code;

      const coupon = await Coupon.findOne({
        where: {
          code: couponCode.toUpperCase(),
          is_active: true,
          [Op.or]: [
            { expired_at: null },
            { expired_at: { [Op.gt]: new Date() } },
          ],
        },
      });

      if (!coupon) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Kupon tidak valid atau sudah kedaluwarsa'],
            en: ['Coupon is not valid or has expired'],
          },
        });
      }

      return res.json({
        code: 200,
        status: 'success',
        data: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          expired_at: coupon.expired_at,
        },
        message: {
          id: ['Kupon valid'],
          en: ['Coupon is valid'],
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
