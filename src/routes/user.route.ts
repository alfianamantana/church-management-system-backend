import { UserController } from '../controllers/user.controller';
import { Router } from 'express';
import auth_superadmin from '../middlewares/auth_superadmin';
import auth_user from '../middlewares/auth_user';
import auth_church from '../middlewares/auth_church';
import auth_main_account from '../middlewares/auth_main_account';
export const UserRoutes = (router: Router): void => {
  // CRUD routes (protected)
  router.get(
    '/',
    [auth_user, auth_main_account, auth_church],
    UserController.getUsers,
  );
  router.put('/', auth_superadmin, UserController.updateUser);
  router.delete('/', auth_superadmin, UserController.deleteUser);
  router.put('/change-password', auth_user, UserController.changePassword);
  router.get('/profile', auth_user, UserController.getProfile);

  // Auth routes (public)
  router.post('/login', UserController.login);
  router.post('/register', UserController.register);
  router.post('/verify-account', [auth_user], UserController.verifyAccount);
  router.post('/resend-otp', UserController.resendOTP);
};
