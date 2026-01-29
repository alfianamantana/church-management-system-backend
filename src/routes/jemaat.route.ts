import { Express } from 'express';
import { JemaatController } from '../controllers/jemaat.controller';

export const JemaatRoutes = (app: Express): void => {
  app.put('/', JemaatController.updateJemaat);
  app.post('/', JemaatController.createJemaat);
  app.get('/', JemaatController.getAll);
};
