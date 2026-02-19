import { Request, Response, NextFunction } from 'express';
import { User, Church, UserChurch } from '../model';
const auth_check_jemaat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const churchId = req.headers.church as string;

    const user = await User.findOne({
      where: { id: userId },
    });

    const userChurch = await UserChurch.findOne({
      where: { user_id: userId, church_id: churchId },
      include: [{ model: Church, as: 'church', include: ['subscribeType'] }],
    });

    const church = userChurch?.church;

    if (
      church &&
      church?.subscribeType?.name === 'bibit' &&
      church.total_jemaat_created >= 100
    ) {
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
      church &&
      church?.subscribeType?.name === 'bertumbuh' &&
      church.total_jemaat_created >= 500
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
