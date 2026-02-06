import { Router } from 'express';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../controllers/asset.controller';

export const AssetRoutes = (router: Router) => {
  router.get('/', getAssets);
  router.post('/', createAsset);
  router.put('/', updateAsset);
  router.delete('/', deleteAsset);
};
