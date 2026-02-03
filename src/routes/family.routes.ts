import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';

export const FamilyRoutes = (router: Router) => {
  router.get('/', FamilyController.getFamilies);
  router.post('/', FamilyController.createFamily);
  router.put('/', FamilyController.updateFamily);
  router.delete('/', FamilyController.deleteFamily);
};
