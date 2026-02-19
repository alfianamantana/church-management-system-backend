import { Router } from 'express';
import { UserRoleController } from '../controllers/user_role.controller';
import auth_user from '../middlewares/auth_user';
import auth_main_account from '../middlewares/auth_main_account';

const router = Router();

// GET /user-roles - Get all user roles (requires superadmin)
router.get('/', auth_user, auth_main_account, UserRoleController.get);

export default router;
