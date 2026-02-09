import { Router } from 'express';
import { getCategories } from '../controllers/category.controller';
import auth_user from '../middlewares/auth_user';
export const CategoryRoutes = (router: Router) => {
  router.get('/', auth_user, getCategories);
};
