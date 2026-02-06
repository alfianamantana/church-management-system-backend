import { Router } from 'express';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../controllers/asset.controller';
import auth_user from '../middlewares/auth_user';
export const AssetRoutes = (router: Router) => {
  router.get('/', auth_user, getAssets);
  router.post('/', auth_user, createAsset);
  router.put('/', auth_user, updateAsset);
  router.delete('/', auth_user, deleteAsset);
};
