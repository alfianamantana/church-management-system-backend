import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import auth_user_active from '../middlewares/auth_user_active';
export const FamilyRoutes = (router: Router) => {
  router.get('/', auth_user_active, FamilyController.get);
  router.post('/', auth_user_active, FamilyController.create);
  router.put('/', auth_user_active, FamilyController.update);
  router.delete('/', auth_user_active, FamilyController.destroy);
};
