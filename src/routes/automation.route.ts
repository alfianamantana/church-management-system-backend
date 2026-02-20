import { Router } from 'express';
import { AutomationController } from '../controllers/automation.controller';
import auth_public from '../middlewares/auth_public';
import auth_church from '../middlewares/auth_church';
import auth_user_active from '../middlewares/auth_user_active';
export const AutomationRoutes = (router: Router) => {
  router.post(
    '/work-birthday-greetings',
    auth_public,
    AutomationController.processDueAutomations,
  );
  router.get(
    '/birthday',
    [auth_user_active, auth_church],
    AutomationController.getBirthDayGreeting,
  );
  router.post(
    '/birthday',
    [auth_user_active, auth_church],
    AutomationController.createOrUpdateBirthdayGreeting,
  );
};
