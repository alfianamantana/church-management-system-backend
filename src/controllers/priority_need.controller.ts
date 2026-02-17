import { Request, Response } from 'express';
import { PriorityNeed } from '../model';

export const PriorityNeedController = {
  async getAll(req: Request, res: Response) {
    try {
      const priorityNeeds = await PriorityNeed.findAll();
      return res.json({
        code: 200,
        status: 'success',
        data: priorityNeeds,
        message: {
          id: ['Data kebutuhan prioritas berhasil diambil'],
          en: ['Priority need data retrieved successfully'],
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
      });
    }
  },
};
