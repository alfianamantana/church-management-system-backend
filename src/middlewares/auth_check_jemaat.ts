import { Request, Response, NextFunction } from 'express';
const auth_check_jemaat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let { user } = req;
    if (user?.subscribe_type === 'bibit' && user.total_jemaat_created >= 100) {
      return res.json({
        code: 403,
        status: 'error',
        message: {
          id: [
            'Batas jemaat untuk tipe langganan Bibit telah tercapai. Silakan tingkatkan langganan Anda untuk menambah lebih banyak jemaat.',
          ],
          en: [
            'The congregation limit for the Seed subscription type has been reached. Please upgrade your subscription to add more congregants.',
          ],
        },
      });
    } else if (
      user?.subscribe_type === 'bertumbuh' &&
      user.total_jemaat_created >= 500
    ) {
      return res.json({
        code: 403,
        status: 'error',
        message: {
          id: [
            'Batas jemaat untuk tipe langganan Bertumbuh telah tercapai. Silakan tingkatkan langganan Anda untuk menambah lebih banyak jemaat.',
          ],
          en: [
            'The congregation limit for the Growing subscription type has been reached. Please upgrade your subscription to add more congregants.',
          ],
        },
      });
    }
    next();
  } catch (error) {
    console.log(error, '/');

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

export default auth_check_jemaat;
