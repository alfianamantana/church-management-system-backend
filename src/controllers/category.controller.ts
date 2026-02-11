import { Request, Response } from 'express';
import { Category, Church } from '../model';

export const getCategories = async (req: Request, res: Response) => {
  try {
    // Get church for the user
    const church = await Church.findOne({ where: { user_id: req.user?.id } });
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

    const categories = await Category.findAll({
      where: { church_id: church.id },
      order: [['createdAt', 'ASC']],
    });

    res.json({
      code: 200,
      message: {
        id: ['Kategori berhasil diambil'],
        en: ['Categories retrieved successfully'],
      },
      data: categories,
    });
  } catch (error) {
    res.json({
      code: 500,
      status: 'error',
      message: {
        id: ['Terjadi kesalahan pada server'],
        en: ['Internal server error'],
      },
      error: error,
    });
  }
};
