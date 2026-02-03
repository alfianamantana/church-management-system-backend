import { Request, Response } from 'express';
import { Category } from '../model';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({
      code: 200,
      message: ['Categories retrieved successfully'],
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      code: 500,
      message: ['Internal server error'],
    });
  }
};
