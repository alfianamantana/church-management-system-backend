import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import auth_user from '../middlewares/auth_user';
import auth_church from '../middlewares/auth_church';

export const DashboardRoutes = (router: Router) => {
  router.get('/', [auth_user, auth_church], DashboardController.dashboard);
};
