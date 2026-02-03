import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';

export const TransactionRoutes = (router: Router) => {
  router.get('/', TransactionController.getTransactions);
  router.post('/', TransactionController.createTransaction);
  router.put('/', TransactionController.updateTransaction);
  router.delete('/', TransactionController.deleteTransaction);
};
