import { UserController } from '../controllers/user.controller';
import { Express } from 'express';

export const UserRoutes = (app: Express): void => {
  app.post('/login', UserController.login);
  app.post('/create', UserController.createUser);
};
