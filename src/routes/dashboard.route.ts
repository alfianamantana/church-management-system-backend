import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import auth_user from '../middlewares/auth_user';
export const DashboardRoutes = (router: Router) => {
  router.get('/', auth_user, DashboardController.dashboard);
};
