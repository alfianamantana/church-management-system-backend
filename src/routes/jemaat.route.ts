import { Router } from 'express';
import { JemaatController } from '../controllers/jemaat.controller';
import auth_user from '../middlewares/auth_user';

export const JemaatRoutes = (router: Router): void => {
  router.put('/', auth_user, JemaatController.updateJemaat);
  router.post('/', auth_user, JemaatController.createJemaat);
  router.get('/', auth_user, JemaatController.getAll);
  router.get('/birthday', auth_user, JemaatController.getBirthdayByMonth);
  router.get('/children', auth_user, JemaatController.getChildren);
  router.delete('/', auth_user, JemaatController.deleteJemaat);
};
