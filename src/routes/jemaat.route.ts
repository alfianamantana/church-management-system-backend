import { Router } from 'express';
import { JemaatController } from '../controllers/jemaat.controller';

export const JemaatRoutes = (router: Router): void => {
  router.put('/', JemaatController.updateJemaat);
  router.post('/', JemaatController.createJemaat);
  router.get('/', JemaatController.getAll);
  router.get('/birthday', JemaatController.getBirthdayByMonth);
  router.delete('/', JemaatController.deleteJemaat);
};
