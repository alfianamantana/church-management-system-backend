import { Router } from 'express';
import { EventController } from '../controllers/event.controller';

export const EventRoutes = (router: Router): void => {
  router.get('/', EventController.getAll);
  router.post('/', EventController.createEvent);
  router.put('/', EventController.updateEvent);
  router.delete('/', EventController.deleteEvent);
};
