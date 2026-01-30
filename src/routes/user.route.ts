import { UserController } from '../controllers/user.controller';
import { Router } from 'express';

export const UserRoutes = (router: Router): void => {
  router.post('/login', UserController.login);
  router.post('/create', UserController.createUser);
};
