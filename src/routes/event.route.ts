import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import auth_user from '../middlewares/auth_user';
export const EventRoutes = (router: Router): void => {
  router.get('/', auth_user, EventController.getAll);
  router.post('/', auth_user, EventController.createEvent);
  router.put('/', auth_user, EventController.updateEvent);
  router.delete('/', auth_user, EventController.deleteEvent);
};
