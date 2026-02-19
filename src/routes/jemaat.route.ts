import { Router } from 'express';
import { CongregationController } from '../controllers/jemaat.controller';
import auth_check_jemaat from '../middlewares/auth_check_jemaat';
import auth_church from '../middlewares/auth_church';
import auth_user_active from '../middlewares/auth_user_active';

export const CongregationRoutes = (router: Router): void => {
  router.get('/', [auth_user_active, auth_church], CongregationController.get);
  router.put(
    '/',
    [auth_user_active, auth_church],
    CongregationController.update,
  );
  router.post(
    '/',
    [auth_user_active, auth_church, auth_check_jemaat],
    CongregationController.create,
  );
  router.get(
    '/birthday',
    [auth_user_active, auth_church],
    CongregationController.getBirthdayByMonth,
  );
  router.get(
    '/children',
    [auth_user_active, auth_church],
    CongregationController.getChildren,
  );
  router.delete(
    '/',
    [auth_user_active, auth_church],
    CongregationController.delete,
  );
};
