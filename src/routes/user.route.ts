import { UserController } from '../controllers/user.controller';
import { Router } from 'express';
import auth_superadmin from '../middlewares/auth_superadmin';
import auth_user from '../middlewares/auth_user';
export const UserRoutes = (router: Router): void => {
  // CRUD routes (protected)
  router.get('/', auth_superadmin, UserController.getUsers);
  router.put('/', auth_superadmin, UserController.updateUser);
  router.delete('/', auth_superadmin, UserController.deleteUser);
  router.put('/change-password', auth_user, UserController.changePassword);
  router.get('/profile', auth_user, UserController.getProfile);

  // Auth routes (public)
  router.post('/login', UserController.login);
  router.post('/register', UserController.register);
  router.post('/create', UserController.createUser);
  router.post('/verify-account', UserController.verifyAccount);
  router.post('/resend-otp', UserController.resendOTP);
};
