import { Request, Response, NextFunction } from 'express';
import { User, Auth, Church } from '../model';

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
      church?: Church | null;
    }
  }
}

const auth_user = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token as string;
    const authorization = req.headers.authorization as string;
    const church = req.headers.church as string;

    if (!token) {
      return res.json({
        code: 401,
        status: 'error',
        message: {
          id: ['Tidak diizinkan'],
          en: ['Unauthorize'],
        },
      });
    }
    const authRecord = await Auth.findOne({ where: { token } });
    if (!authRecord) {
      return res.json({
        code: 401,
        status: 'error',
        message: {
          id: ['Tidak diizinkan'],
          en: ['Unauthorize'],
        },
      });
    }

    if (new Date() > authRecord.valid_until) {
      return res.json({
        code: 401,
        status: 'error',
        message: {
          id: ['Tidak diizinkan'],
          en: ['Unauthorize'],
        },
      });
    }
    const user = await User.findOne({ where: { id: authRecord.user_id } });
    if (!user) {
      return res.json({
        code: 401,
        status: 'error',
        message: {
          id: ['Tidak diizinkan'],
          en: ['Unauthorize'],
        },
      });
    }

    if (user.unique_key !== authorization) {
      return res.json({
        code: 401,
        status: 'error',
        message: {
          id: ['Tidak diizinkan'],
          en: ['Unauthorize'],
        },
      });
    }

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

    if (finded_church.user_id !== user.id) {
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
    (req as Express.Request).user = user;
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

export default auth_user;
