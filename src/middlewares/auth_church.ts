import { Request, Response, NextFunction } from 'express';
import { Church, UserChurch, ChurchSubscription } from '../model';
import { Op } from 'sequelize';

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

    // Allow read-only requests even if subscription is not active/trial
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      const activeSub = await ChurchSubscription.findOne({
        where: {
          church_id: churchId,
          status: {
            [Op.in]: ['trial', 'active'],
          },
        },
        order: [['created_at', 'DESC']],
      });

      if (!activeSub) {
        return res.json({
          code: 403,
          status: 'error',
          message: {
            id: [
              'Aksi tidak diizinkan: status gereja tidak aktif, silakan berlangganan untuk mengaktifkan fitur ini',
            ],
            en: [
              'Action not allowed: church status is not active, please subscribe to activate this feature',
            ],
          },
        });
      }
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

export default auth_church;
