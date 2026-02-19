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
      include: [{ model: Church, as: 'church' }],
    });

    const church = userChurch?.church;

    // Subscription-based limits removed - no longer checking congregation limits
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
