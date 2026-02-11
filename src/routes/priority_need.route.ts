import { PriorityNeedController } from '../controllers/priority_need.controller';
import { Router } from 'express';

export const PriorityNeedRoutes = (router: Router): void => {
  router.get('/', PriorityNeedController.getAll);
};
