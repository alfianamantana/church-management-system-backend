import { Request, Response } from 'express';
import Validator from 'validatorjs';
import { User, Auth, PriorityNeed, UserPriorityNeed, Church } from '../model';
import bcrypt from 'bcrypt';
import { generateToken } from '../helpers';
import { Op } from 'sequelize';

export const UserController = {
  async getProfile(req: Request, res: Response) {
    try {
      const user = req.user;
      const church = req.query.church === 'true';

      let includeCondition: any = [];

      if (church) {
        includeCondition.push({ model: Church });
      }

      const userInstance = await User.findOne({
        where: { id: user?.id },
        include: includeCondition,
      });

      return res.json({
        code: 200,
        status: 'success',
        data: [userInstance],
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
          message: {
            id: ['Validasi gagal'],
            en: ['Validation failed'],
          },
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
          message: {
            id: ['Validasi gagal'],
            en: ['Validation failed'],
          },
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
          message: {
            id: ['Validasi gagal'],
            en: ['Validation failed'],
          },
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
      console.log(req.body, 'bodss');

      // const { name, email, password, phone_number, role, subscribe_type } =
      //   req.body;

      // const subscribe_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      // const unique_key = Math.random().toString(36).substring(2, 15);
      // const rules = {
      //   name: 'required|string',
      //   email: 'required|email',
      //   password: 'required|string',
      //   phone_number: 'required|string',
      //   role: 'string|in:superadmin,user',
      //   subscribe_type: 'required|string|in:bibit,bertumbuh,full',
      // };

      // const validation = new Validator(
      //   { name, email, password, phone_number, role, subscribe_type },
      //   rules,
      // );
      // if (validation.fails()) {
      //   return res.json({
      //     code: 400,
      //     status: 'error',
      //     message: {
      //   id: ['Validasi gagal'],
      // en: ['Validation failed']}
      //   });
      // }

      // const existing = await User.findOne({ where: { email } });
      // if (existing) {
      //   return res.json({
      //     code: 400,
      //     status: 'error',
      //     message: {
      //       id: ['Email sudah ada'],
      //       en: ['Email already exists'],
      //     },
      //   });
      // }

      // const hashedPassword = await bcrypt.hash(password, 10);

      // await User.create({
      //   name,
      //   email,
      //   password: hashedPassword,
      //   phone_number,
      //   subscribe_until,
      //   role: role || undefined,
      //   subscribe_type,
      //   unique_key,
      // });

      // return res.json({
      //   code: 201,
      //   status: 'success',
      //   message: {
      //     id: ['Pengguna berhasil dibuat'],
      //     en: ['User created successfully'],
      //   },
      // });
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
          message: {
            id: ['Validasi gagal'],
            en: ['Validation failed'],
          },
        });

      const userInstance = await User.findOne({
        where: { email },
        include: [{ model: Church }],
      });

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

  async register(req: Request, res: Response) {
    try {
      const { name, email, password, phone_number, priority_needs, country } =
        req.body;

      const rules = {
        name: 'required|string|min:2|max:255',
        email: 'required|email',
        password: 'required|string|min:6',
        phone_number: 'required|string|min:10|max:15',
        priority_needs: 'array',
        'priority_needs.*': 'numeric',
        country: 'required|string|min:2|max:255',
      };

      const validation = new Validator(
        { name, email, password, phone_number, priority_needs, country },
        rules,
      );

      if (validation.fails()) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Validasi gagal'],
            en: ['Validation failed'],
          },
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Email sudah terdaftar'],
            en: ['Email already registered'],
          },
        });
      }

      // Validate priority needs if provided
      if (priority_needs && priority_needs.length > 0) {
        const validPriorityNeeds = await PriorityNeed.findAll({
          where: { id: { [Op.in]: priority_needs } },
        });

        if (validPriorityNeeds.length !== priority_needs.length) {
          return res.json({
            code: 400,
            status: 'error',
            message: {
              id: ['Beberapa kebutuhan prioritas tidak valid'],
              en: ['Some priority needs are invalid'],
            },
          });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Set default subscription (3 days trial)
      const subscribe_until = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const unique_key =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Create user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phone_number,
        subscribe_until,
        role: 'user',
        subscribe_type: 'bibit', // Default to trial
        unique_key,
        is_trial_account: true,
        is_main_account: true,
        otp: otp,
        is_verified: false,
        country,
      });

      // Save priority needs if provided
      if (priority_needs && priority_needs.length > 0) {
        const userPriorityNeeds = priority_needs.map((priorityId: number) => ({
          user_id: newUser.id,
          priority_need_id: priorityId,
        }));

        await UserPriorityNeed.bulkCreate(userPriorityNeeds);
      }

      // Generate token and create auth record
      const token = generateToken(25);
      const valid_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await Auth.create({ user_id: newUser.id, token, valid_until });

      // Get user data without password
      const { password: _, ...userData } = newUser.get({ plain: true });

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Pendaftaran berhasil'],
          en: ['Registration successful'],
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
        error: err,
      });
    }
  },

  async verifyAccount(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      const rules = {
        email: 'required|email',
        otp: 'required|string|size:6',
      };

      const validation = new Validator({ email, otp }, rules);
      if (validation.fails()) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Validasi gagal'],
            en: ['Validation failed'],
          },
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

      if (user.is_verified) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Akun sudah diverifikasi'],
            en: ['Account already verified'],
          },
        });
      }

      if (user.otp !== otp) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['OTP tidak valid'],
            en: ['Invalid OTP'],
          },
        });
      }

      // Verify the account
      user.is_verified = true;
      user.otp = undefined; // Clear OTP after verification
      await user.save();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Akun berhasil diverifikasi'],
          en: ['Account verified successfully'],
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

  async resendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const rules = {
        email: 'required|email',
      };

      const validation = new Validator({ email }, rules);
      if (validation.fails()) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Validasi gagal'],
            en: ['Validation failed'],
          },
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

      if (user.is_verified) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Akun sudah diverifikasi'],
            en: ['Account already verified'],
          },
        });
      }

      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

      // Update user's OTP
      user.otp = newOtp;
      await user.save();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['OTP berhasil dikirim ulang'],
          en: ['OTP sent successfully'],
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
};
