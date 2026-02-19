import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import auth_user from '../middlewares/auth_user';
import auth_church from '../middlewares/auth_church';
export const TransactionRoutes = (router: Router) => {
  router.get('/', [auth_user, auth_church], TransactionController.get);
  router.post('/', [auth_user, auth_church], TransactionController.create);
  router.put('/', [auth_user, auth_church], TransactionController.update);
  router.delete('/', [auth_user, auth_church], TransactionController.destroy);
};
