import { Request, Response } from 'express';
import {
  User,
  Auth,
  PriorityNeed,
  UserPriorityNeed,
  Church,
  UserOtp,
  UserRole,
  SubscribeType,
} from '../model';
import sequelize from '../../config/db.config';
import { Transaction } from 'sequelize';
import bcrypt from 'bcrypt';
import { generateToken } from '../helpers';
import { validateField, getValidationRules } from '../helpers';
import { Op } from 'sequelize';
import {
  validateRequired,
  validateRequiredEn,
  validateNumeric,
  validateNumericEn,
} from '../helpers';

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
      const { church } = req;

      let { page = 1, limit = 10, q } = req.query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const offset = (page - 1) * limit;

      let whereClause: any = {
        church_id: church?.id,
      };

      if (q) {
        whereClause = {
          ...whereClause,
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
        include: [{ model: UserRole, as: 'userRole' }],
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

      // Validation
      const errorsId: string[] = [];
      const errorsEn: string[] = [];
      const errors = validateField(id, {
        id: [
          { validator: validateRequired, args: ['id'] },
          { validator: validateNumeric, args: ['id'] },
        ],
        en: [
          { validator: validateRequiredEn, args: ['id'] },
          { validator: validateNumericEn, args: ['id'] },
        ],
      });
      if (errors.id) errorsId.push(errors.id);
      if (errors.en) errorsEn.push(errors.en);
      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

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
      if (role) {
        // Find or create role record
        let roleRecord = await UserRole.findOne({ where: { name: role } });
        if (!roleRecord) {
          roleRecord = await UserRole.create({ name: role });
        }
        user.role_id = roleRecord.id;
      }
      if (subscribe_type) {
        // Find or create subscribe type record
        let subscribeTypeRecord = await SubscribeType.findOne({
          where: { name: subscribe_type },
        });
        if (!subscribeTypeRecord) {
          subscribeTypeRecord = await SubscribeType.create({
            name: subscribe_type,
          });
        }
        user.subscribe_type_id = subscribeTypeRecord.id;
      }

      await user.save();

      // Reload user with role and subscribe type relationships
      const updatedUser = await User.findOne({
        where: { id: user.id },
        attributes: { exclude: ['password'] },
        include: [
          { model: UserRole, as: 'userRole' },
          { model: SubscribeType, as: 'subscribeType' },
        ],
      });

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Pengguna berhasil diperbarui'],
          en: ['User updated successfully'],
        },
        data: updatedUser,
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

      // Validation
      const errorsId: string[] = [];
      const errorsEn: string[] = [];
      const errors = validateField(id, {
        id: [
          { validator: validateRequired, args: ['id'] },
          { validator: validateNumeric, args: ['id'] },
        ],
        en: [
          { validator: validateRequiredEn, args: ['id'] },
          { validator: validateNumericEn, args: ['id'] },
        ],
      });
      if (errors.id) errorsId.push(errors.id);
      if (errors.en) errorsEn.push(errors.en);
      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

      const user = await User.findOne({
        where: { id: Number(id) },
        include: [{ model: UserRole, as: 'userRole' }],
      });
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
      if (user.userRole?.name === 'superadmin') {
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

      // Validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];
      const fields = {
        current_password: {
          value: current_password,
          rules: validationRules.password,
        },
        new_password: { value: new_password, rules: validationRules.password },
      };
      Object.entries(fields).forEach(([fieldName, config]) => {
        const errors = validateField(config.value, config.rules);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      });
      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
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
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];
      const fields = {
        email: { value: email, rules: validationRules.email },
        password: { value: password, rules: validationRules.password },
      };
      Object.entries(fields).forEach(([fieldName, config]) => {
        const errors = validateField(config.value, config.rules);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      });
      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

      const userInstance = await User.findOne({
        where: { email },
        include: [{ model: Church }],
      });

      if (!userInstance)
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Email atau kata sandi salah'],
            en: ['Email or password is incorrect'],
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
            id: [
              'Langganan kedaluwarsa, silakan perbarui untuk terus menggunakan layanan',
            ],
            en: [
              'Subscription expired, please renew to continue using the service',
            ],
          },
        });
      }

      const match = await bcrypt.compare(password, userInstance.password);

      if (!match)
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Email atau kata sandi salah'],
            en: ['Email or password is incorrect'],
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
    let transaction: Transaction | null = null;
    try {
      transaction = await sequelize.transaction();
      const { email, password, phone_number, priority_needs } = req.body;

      const name = req.body.name?.trim();

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate each field
      const fields = {
        name: { value: name, rules: validationRules.name },
        email: { value: email, rules: validationRules.email },
        password: { value: password, rules: validationRules.password },
        phone_number: {
          value: phone_number,
          rules: validationRules.phone_number,
        },
      };

      Object.entries(fields).forEach(([fieldName, config]) => {
        const errors = validateField(config.value, config.rules);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      });

      // Validate priority_needs if provided
      if (priority_needs !== undefined) {
        const errors = validateField(
          priority_needs,
          validationRules.priority_needs,
        );
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      // If there are validation errors, return them
      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

      // Check if email already exists
      const existingUser = await User.findOne({
        where: { email },
        transaction,
      });
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
          transaction,
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
      // Create user role if it doesn't exist
      let userRole = await UserRole.findOne({
        where: { name: 'superadmin' },
        transaction,
      });
      if (!userRole) {
        userRole = await UserRole.create(
          { name: 'superadmin' },
          { transaction },
        );
      }

      // Create subscribe type if it doesn't exist
      let bibitSubscribeType = await SubscribeType.findOne({
        where: { name: 'bibit' },
        transaction,
      });
      if (!bibitSubscribeType) {
        bibitSubscribeType = await SubscribeType.create(
          { name: 'bibit' },
          { transaction },
        );
      }

      // Create user
      const newUser = await User.create(
        {
          name,
          email,
          password: hashedPassword,
          phone_number,
          subscribe_until,
          role_id: userRole.id,
          subscribe_type_id: bibitSubscribeType.id, // Default to trial
          unique_key,
          is_verified: false,
        },
        { transaction },
      );

      // Create OTP record
      const expiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await UserOtp.create(
        {
          user_id: newUser.id,
          code: otp,
          type: 'activation',
          expired_at: expiredAt,
        },
        { transaction },
      );

      // Save priority needs if provided
      if (priority_needs && priority_needs.length > 0) {
        const validPriorityNeeds = await PriorityNeed.findAll({
          where: { id: { [Op.in]: priority_needs } },
          transaction,
        });

        const userPriorityNeeds = validPriorityNeeds.map((priorityNeed) => ({
          user_id: newUser.id,
          priority_need_id: priorityNeed.id,
        }));

        await UserPriorityNeed.bulkCreate(userPriorityNeeds, { transaction });
      }

      // Generate token and create auth record
      const token = generateToken(25);
      const valid_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await Auth.create(
        {
          user_id: newUser.id,
          token,
          valid_until,
        },
        { transaction },
      );

      // Get user data without password
      const { password: _, ...userData } = newUser.get({ plain: true });
      await transaction!.commit();

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
      if (transaction) {
        await transaction.rollback();
      }

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

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate each field
      const fields = {
        email: { value: email, rules: validationRules.email },
        otp: { value: otp, rules: validationRules.otp },
      };

      Object.entries(fields).forEach(([fieldName, config]) => {
        const errors = validateField(config.value, config.rules);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      });

      // If there are validation errors, return them
      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
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

      // Find the latest activation OTP
      const userOtp = await UserOtp.findOne({
        where: {
          user_id: user.id,
          type: 'activation',
          expired_at: { [Op.gt]: new Date() },
        },
        order: [['created_at', 'DESC']],
      });

      if (!userOtp || userOtp.code !== otp) {
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
      await user.save();

      // Delete the used OTP
      await userOtp.destroy();

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
      });
    }
  },

  async resendOTP(req: Request, res: Response) {
    let transaction: Transaction | null = null;
    try {
      transaction = await sequelize.transaction();
      const { email } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate email field
      const errors = validateField(email, validationRules.email);
      if (errors.id) errorsId.push(errors.id);
      if (errors.en) errorsEn.push(errors.en);

      // If there are validation errors, return them
      if (errorsId.length > 0 || errorsEn.length > 0) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
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

      // Delete existing activation OTPs
      await UserOtp.destroy({
        where: {
          user_id: user.id,
          type: 'activation',
        },
        transaction,
      });

      // Create new OTP record
      const expiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await UserOtp.create(
        {
          user_id: user.id,
          code: newOtp,
          type: 'activation',
          expired_at: expiredAt,
        },
        { transaction },
      );

      await transaction.commit();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['OTP berhasil dikirim ulang'],
          en: ['OTP sent successfully'],
        },
      });
    } catch (err) {
      if (transaction) {
        await transaction.rollback();
      }

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
