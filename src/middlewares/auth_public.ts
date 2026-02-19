import { Request, Response, NextFunction } from 'express';
const auth_public = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['publ'];
    if (!authHeader) {
      return res.json({
        code: 401,
        status: 'error',
        message: {
          id: ['Header publik tidak ditemukan'],
          en: ['Public header not found'],
        },
      });
    }
    if (authHeader !== process.env.auth_key) {
      return res.json({
        code: 401,
        status: 'error',
        message: {
          id: ['Header publik tidak valid'],
          en: ['Invalid public header'],
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

export default auth_public;
