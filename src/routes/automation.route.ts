import { Router } from 'express';
import { AutomationController } from '../controllers/automation.controller';
import auth_public from '../middlewares/auth_public';
export const AutomationRoutes = (router: Router) => {
  router.post(
    '/birthday',
    auth_public,
    AutomationController.processDueAutomations,
  );
};
