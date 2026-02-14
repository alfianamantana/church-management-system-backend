import { Request, Response } from 'express';
import { Category, Church } from '../model';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
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
