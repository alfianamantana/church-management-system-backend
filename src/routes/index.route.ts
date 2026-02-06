import { IndexController } from '../controllers/index.controller';
import { Express } from 'express';
import { UserRoutes } from './user.route';
import { JemaatRoutes } from './jemaat.route';
import auth_user from '../middlewares/auth_user';

export const router = (app: Express): void => {
  app.use('/users', auth_user, UserRoutes);
  app.use('/jemaat', auth_user, JemaatRoutes);

  app.use(IndexController.fallback);
};
