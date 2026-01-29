import { Request, Response } from 'express';

export const IndexController = {
  index(req: Request, res: Response): Response {
    return res.send({
      code: 200,
      status: 'success',
      message: ['API is running'],
    });
  },
  fallback(req: Request, res: Response): Response {
    return res.send({
      status: 'error',
      code: 404,
      message: ['route not found'],
    });
  },
};
