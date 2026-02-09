import { Request, Response } from 'express';

export const IndexController = {
  index(req: Request, res: Response): Response {
    return res.json({
      code: 200,
      status: 'success',
      message: {
        id: ['API sedang berjalan'],
        en: ['API is running'],
      },
    });
  },
  fallback(req: Request, res: Response): Response {
    return res.json({
      status: 'error',
      code: 404,
      message: {
        id: ['rute tidak ditemukan'],
        en: ['route not found'],
      },
    });
  },
};
