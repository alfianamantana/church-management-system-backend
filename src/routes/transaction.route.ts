import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import auth_user from '../middlewares/auth_user';
export const TransactionRoutes = (router: Router) => {
  router.get('/', auth_user, TransactionController.getTransactions);
  router.post('/', auth_user, TransactionController.createTransaction);
  router.put('/', auth_user, TransactionController.updateTransaction);
  router.delete('/', auth_user, TransactionController.deleteTransaction);
};
