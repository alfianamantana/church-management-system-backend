import { Request, Response } from 'express';
import Validator from 'validatorjs';
import { User, Auth } from '../model';
import bcrypt from 'bcrypt';
import { generateToken } from '../helpers';
import { Op } from 'sequelize';

export const UserController = {
  async getProfile(req: Request, res: Response) {
    try {
      const user = req.user;
      let userData = {
        ...user?.get({ plain: true }),
      };
      delete userData?.password;

      // Add expire field based on role and subscribe_type
      let expire = null;
      if (user?.role !== 'superadmin' && user?.subscribe_type !== 'full') {
        expire = user?.subscribe_until;
      }
      userData.expire = expire;

      return res.json({
        code: 200,
        status: 'success',
        data: userData,
        message: {
          id: ['Profil pengguna berhasil diambil'],
          en: ['User profile retrieved successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },
  // Get all users with pagination and search
  async getUsers(req: Request, res: Response) {
    try {
      let { page = 1, limit = 10, q } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause: any = {};
      if (q) {
        whereClause = {
          [Op.or]: [
            { name: { [Op.iLike]: `%${q}%` } },
            { email: { [Op.iLike]: `%${q}%` } },
          ],
        };
      }

      const { count, rows } = await User.findAndCountAll({
        offset,
        limit,
        where: whereClause,
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: rows,
        pagination: { total: count, page, limit },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const {
        name,
        email,
        phone_number,
        subscribe_until,
        role,
        subscribe_type,
      } = req.body;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const user = await User.findOne({ where: { id: Number(id) } });
      if (!user) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Pengguna tidak ditemukan'],
            en: ['User not found'],
          },
        });
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.json({
            code: 400,
            status: 'error',
            message: {
              id: ['Email sudah ada'],
              en: ['Email already exists'],
            },
          });
        }
        user.email = email;
      }

      if (name) user.name = name;
      if (phone_number) user.phone_number = phone_number;
      if (subscribe_until !== undefined) user.subscribe_until = subscribe_until;
      if (role) user.role = role;
      if (subscribe_type) user.subscribe_type = subscribe_type;

      await user.save();

      const { password: _, ...userData } = user.get({ plain: true });

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Pengguna berhasil diperbarui'],
          en: ['User updated successfully'],
        },
        data: userData,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.query;

      const rules = { id: 'required|numeric' };
      const validation = new Validator({ id }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const user = await User.findOne({ where: { id: Number(id) } });
      if (!user) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Pengguna tidak ditemukan'],
            en: ['User not found'],
          },
        });
      }

      // Prevent deletion of superadmin
      if (user.role === 'superadmin') {
        return res.json({
          code: 403,
          status: 'error',
          message: {
            id: ['Tidak dapat menghapus superadmin'],
            en: ['Cannot delete superadmin'],
          },
        });
      }

      await user.destroy();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Pengguna berhasil dihapus'],
          en: ['User deleted successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      let { email } = req.user as User;
      const { current_password, new_password } = req.body;

      const rules = {
        current_password: 'required|string',
        new_password: 'required|string|min:6',
      };

      const validation = new Validator(
        { current_password, new_password },
        rules,
      );
      if (validation.fails()) {
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Pengguna tidak ditemukan'],
            en: ['User not found'],
          },
        });
      }

      const match = await bcrypt.compare(current_password, user.password);
      if (!match) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Kata sandi lama salah'],
            en: ['Old password is incorrect'],
          },
        });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      user.password = hashedPassword;
      await user.save();
      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Kata sandi berhasil diubah'],
          en: ['Password changed successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server internal'],
          en: ['Internal server error'],
        },
      });
    }
  },
  async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, phone_number, role, subscribe_type } =
        req.body;

      const subscribe_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const unique_key = Math.random().toString(36).substring(2, 15);
      const rules = {
        name: 'required|string',
        email: 'required|email',
        password: 'required|string',
        phone_number: 'required|string',
        role: 'string|in:superadmin,user',
        subscribe_type: 'required|string|in:bibit,bertumbuh,full',
      };

      const validation = new Validator(
        { name, email, password, phone_number, role, subscribe_type },
        rules,
      );
      if (validation.fails()) {
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });
      }

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Email sudah ada'],
            en: ['Email already exists'],
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        name,
        email,
        password: hashedPassword,
        phone_number,
        subscribe_until,
        role: role || undefined,
        subscribe_type,
        unique_key,
      });

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Pengguna berhasil dibuat'],
          en: ['User created successfully'],
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Kesalahan server'],
          en: ['Internal server error'],
        },
      });
    }
  },
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const rules = { email: 'required|email', password: 'required|string' };
      const validation = new Validator({ email, password }, rules);
      if (validation.fails())
        return res.json({
          code: 400,
          status: 'error',
          message: validation.errors.all(),
        });

      const userInstance = await User.findOne({ where: { email } });

      if (!userInstance)
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Kredensial tidak valid'],
            en: ['Invalid credentials'],
          },
        });

      // Check if subscription has expired
      if (
        userInstance.subscribe_until &&
        new Date() > userInstance.subscribe_until
      ) {
        return res.json({
          code: 403,
          status: 'error',
          message: {
            id: ['Langganan kedaluwarsa'],
            en: ['Subscription expired'],
          },
        });
      }

      const match = await bcrypt.compare(password, userInstance.password);

      if (!match)
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Kredensial tidak valid'],
            en: ['Invalid credentials'],
          },
        });

      const token = generateToken(25);
      const valid_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const existingInstance = await Auth.findOne({
        where: { user_id: userInstance.id },
      });

      if (existingInstance) {
        await existingInstance.update({ token, valid_until });
      } else {
        await Auth.create({ user_id: userInstance.id, token, valid_until });
      }

      const { password: _, ...userData } = userInstance.get({ plain: true });

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Login berhasil'],
          en: ['Login successful'],
        },
        token: token,
        data: userData,
      });
    } catch (err) {
      return res.json({
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
