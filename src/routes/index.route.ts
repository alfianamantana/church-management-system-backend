import { IndexController } from '../controllers/index.controller';
import { Express } from 'express';
import { UserRoutes } from './user.route';
import { JemaatRoutes } from './jemaat.route';

export const router = (app: Express): void => {
  app.use('/users', UserRoutes);
  app.use('/jemaat', JemaatRoutes);

  app.use(IndexController.fallback);
};
