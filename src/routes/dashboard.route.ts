import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import auth_church from '../middlewares/auth_church';
import auth_user_active from '../middlewares/auth_user_active';
export const DashboardRoutes = (router: Router) => {
  router.get(
    '/',
    [auth_user_active, auth_church],
    DashboardController.dashboard,
  );
};
