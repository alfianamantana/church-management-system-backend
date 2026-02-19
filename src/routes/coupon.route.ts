import { CouponController } from '../controllers/coupon.controller';
import { Router } from 'express';
import auth_superadmin from '../middlewares/auth_superadmin';
import auth_user_active from '../middlewares/auth_user_active';

export const CouponRoutes = (router: Router): void => {
  // All coupon routes require superadmin access
  router.get('/', auth_user_active, auth_superadmin, CouponController.get);
  router.post('/', auth_user_active, auth_superadmin, CouponController.create);
  router.put(
    '/:id',
    auth_user_active,
    auth_superadmin,
    CouponController.update,
  );
  router.delete(
    '/:id',
    auth_user_active,
    auth_superadmin,
    CouponController.delete,
  );

  // Public route for coupon validation (used during church creation)
  router.get('/validate/:code', CouponController.validate);
};
