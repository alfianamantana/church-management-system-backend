import { Request, Response, NextFunction } from 'express';
import { User, Auth } from '../model';

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
    const token = req.headers.token as string;
    const authorization = req.headers.authorization as string;
    if (!token) {
      return res.json({
        code: 401,
        status: 'error',
        message: 'Unauthorized: No token provided',
      });
    }
    const authRecord = await Auth.findOne({ where: { token } });
    if (!authRecord) {
      return res.json({
        code: 401,
        status: 'error',
        message: 'Unauthorized: Invalid token',
      });
    }

    if (new Date() > authRecord.valid_until) {
      return res.json({
        code: 401,
        status: 'error',
        message: 'Unauthorized: Token has expired',
      });
    }
    const user = await User.findOne({ where: { id: authRecord.user_id } });
    if (!user) {
      return res.json({
        code: 401,
        status: 'error',
        message: 'Unauthorized: User not found',
      });
    }

    if (user.unique_key !== authorization) {
      return res.json({
        code: 401,
        status: 'error',
        message: 'Unauthorized: Invalid authorization key',
      });
    }

    if (user.role !== 'superadmin') {
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
