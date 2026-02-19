import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import auth_church from '../middlewares/auth_church';
import auth_user_active from '../middlewares/auth_user_active';
export const CategoryRoutes = (router: Router) => {
  // CRUD routes (protected by church auth)
  router.get('/', [auth_user_active, auth_church], CategoryController.get);
  router.post('/', [auth_user_active, auth_church], CategoryController.create);
  router.put('/', [auth_user_active, auth_church], CategoryController.update);
  router.delete(
    '/',
    [auth_user_active, auth_church],
    CategoryController.destroy,
  );
};
