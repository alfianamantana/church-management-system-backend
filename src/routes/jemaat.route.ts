import { Router } from 'express';
import { JemaatController } from '../controllers/jemaat.controller';
import auth_user from '../middlewares/auth_user';
import auth_check_jemaat from '../middlewares/auth_check_jemaat';
import auth_church from '../middlewares/auth_church';
export const JemaatRoutes = (router: Router): void => {
  router.put('/', [auth_user, auth_church], JemaatController.update);
  router.post(
    '/',
    [auth_user, auth_church, auth_check_jemaat],
    JemaatController.createJemaat,
  );
  router.get('/', [auth_user, auth_church], JemaatController.getAll);
  router.get(
    '/birthday',
    [auth_user, auth_church],
    JemaatController.getBirthdayByMonth,
  );
  router.get(
    '/children',
    [auth_user, auth_church],
    JemaatController.getChildren,
  );
  router.delete('/', [auth_user, auth_church], JemaatController.deleteJemaat);
};
