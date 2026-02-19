import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import auth_user_active from '../middlewares/auth_user_active';
import auth_church from '../middlewares/auth_church';
export const EventRoutes = (router: Router): void => {
  router.get('/', [auth_user_active, auth_church], EventController.get);
  router.post('/', [auth_user_active, auth_church], EventController.create);
  router.put('/', [auth_user_active, auth_church], EventController.update);
  router.delete('/', [auth_user_active, auth_church], EventController.destroy);
};
