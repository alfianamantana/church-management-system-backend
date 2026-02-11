import { ChurchController } from '../controllers/church.controller';
import { Router } from 'express';
import auth_user from '../middlewares/auth_user';

export const ChurchRoutes = (router: Router): void => {
  router.get('/', auth_user, ChurchController.getAll);
  router.post('/', auth_user, ChurchController.create);
  router.put('/:id', auth_user, ChurchController.update);
  router.delete('/:id', auth_user, ChurchController.delete);
};
