import { Request, Response, NextFunction } from 'express';

const auth_main_account = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user } = req;

    if (user?.userRole?.name !== 'superadmin') {
      return res.json({
        code: 403,
        status: 'error',
        message: {
          id: ['Akses ditolak'],
          en: ['Access denied'],
        },
      });
    }

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

export default auth_main_account;
