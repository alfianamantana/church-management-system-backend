import { Request, Response } from 'express';
import { UserRole } from '../model';
import { getValidationRules, validateField } from '../helpers';

export const UserRoleController = {
  async get(req: Request, res: Response) {
    try {
      const userRoles = await UserRole.findAll({
        order: [['created_at', 'ASC']],
      });

      res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['User roles berhasil diambil'],
          en: ['User roles retrieved successfully'],
        },
        data: userRoles,
      });
    } catch (error) {
      console.error('Error fetching user roles:', error);
      res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },
};
