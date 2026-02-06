import { Request, Response } from 'express';
import { Category } from '../model';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      where: { user_id: req.user?.id },
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
      message: {
        id: ['Terjadi kesalahan pada server'],
        en: ['Internal server error'],
      },
    });
  }
};
