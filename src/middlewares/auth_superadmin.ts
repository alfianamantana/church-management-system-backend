import { Request, Response, NextFunction } from 'express';
import { User, Auth, UserRole, SubscribeType } from '../model';

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
}

const auth_superadmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req as Express.Request;

    if (user?.userRole?.name !== 'superadmin') {
      return res.json({
        code: 403,
        status: 'error',
        message: 'Forbidden role',
      });
    }

    req.user = user;

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

export default auth_superadmin;
