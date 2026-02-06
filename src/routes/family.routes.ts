import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import auth_user from '../middlewares/auth_user';
export const FamilyRoutes = (router: Router) => {
  router.get('/', auth_user, FamilyController.getFamilies);
  router.post('/', auth_user, FamilyController.createFamily);
  router.put('/', auth_user, FamilyController.updateFamily);
  router.delete('/', auth_user, FamilyController.deleteFamily);
};
