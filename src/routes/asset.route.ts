import { Router } from 'express';
import { AssetController as controller } from '../controllers/asset.controller';
import auth_user_active from '../middlewares/auth_user_active';
import auth_church from '../middlewares/auth_church';
export const AssetRoutes = (router: Router) => {
  router.get('/', [auth_user_active, auth_church], controller.get);
  router.post('/', [auth_user_active, auth_church], controller.create);
  router.put('/', [auth_user_active, auth_church], controller.update);
  router.delete('/', [auth_user_active, auth_church], controller.destroy);
};
