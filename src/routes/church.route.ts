import { ChurchController } from '../controllers/church.controller';
import { Router } from 'express';
import auth_user from '../middlewares/auth_user';
import auth_church from '../middlewares/auth_church';
export const ChurchRoutes = (router: Router): void => {
  router.get('/', auth_user, ChurchController.getAll);
  router.post('/', auth_user, ChurchController.create);
  router.put('/:id', auth_user, auth_church, ChurchController.update);
  router.delete('/:id', auth_user, auth_church, ChurchController.delete);
};
