import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

export const DashboardRoutes = (router: Router) => {
  router.get('/', DashboardController.dashboard);
};
