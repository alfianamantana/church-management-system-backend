import { Router } from 'express';
import { getCategories } from '../controllers/category.controller';

export const CategoryRoutes = (router: Router) => {
  router.get('/', getCategories);
};
