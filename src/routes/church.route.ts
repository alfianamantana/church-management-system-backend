import { ChurchController } from '../controllers/church.controller';
import { Router } from 'express';
import auth_church from '../middlewares/auth_church';
import auth_user_active from '../middlewares/auth_user_active';
export const ChurchRoutes = (router: Router): void => {
  router.get('/', auth_user_active, ChurchController.get);
  router.post('/', auth_user_active, ChurchController.create);
  router.put('/', auth_user_active, auth_church, ChurchController.update);
};
