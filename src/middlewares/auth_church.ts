import { Request, Response, NextFunction } from 'express';
import { Church } from '../model';

declare global {
  namespace Express {
    interface Request {
      church?: Church | null;
    }
  }
}

const auth_church = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const church = req.headers.church as string;
    const finded_church = await Church.findOne({ where: { id: church } });

    if (!finded_church) {
      return res.json({
        code: 401,
        status: 'error',
        message: {
          id: ['Tidak diizinkan'],
          en: ['Unauthorize'],
        },
      });
    }

    if (finded_church.user_id !== user?.id) {
      return res.json({
        code: 401,
        status: 'error',
        message: {
          id: ['Tidak diizinkan'],
          en: ['Unauthorize'],
        },
      });
    }
    (req as Express.Request).church = finded_church;
    next();
  } catch (error) {
    return res.json({
      code: 500,
      status: 'error',
      message: {
        id: ['Kesalahan server internal'],
        en: ['Internal server error'],
      },
    });
  }
};

export default auth_church;
