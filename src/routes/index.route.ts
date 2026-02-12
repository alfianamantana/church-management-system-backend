import { IndexController } from '../controllers/index.controller';
import { Express } from 'express';

export const router = (app: Express): void => {
  app.use(IndexController.fallback);
};
