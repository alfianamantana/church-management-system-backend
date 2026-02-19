import { Request, Response, NextFunction } from 'express';
import { Church, UserChurch } from '../model';

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
    const churchId = req.headers.church as string;

    const userChurch = await UserChurch.findOne({
      where: { user_id: user?.id, church_id: churchId },
      include: [{ model: Church, as: 'church' }],
    });

    if (!userChurch) {
      return res.json({
        code: 401,
        status: 'error',
        message: {
          id: ['Tidak diizinkan'],
          en: ['Unauthorize'],
        },
      });
    }

    (req as Express.Request).church = userChurch.church;
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
