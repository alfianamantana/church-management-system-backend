import { Request, Response } from 'express';
import Validator from 'validatorjs';
import { User, Auth } from '../model';
import bcrypt from 'bcrypt';
import { generateToken } from '../helpers';

export const UserController = {
  async changePassword(req: Request, res: Response) {
    try {
      const { email, oldPassword, newPassword } = req.body;

      const rules = {
        email: 'required|email',
        oldPassword: 'required|string',
        newPassword: 'required|string|min:6',
      };

      const validation = new Validator(
        { email, oldPassword, newPassword },
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
          message: ['User not found'],
        });
      }

      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) {
        return res.json({
          code: 400,
          status: 'error',
          message: ['Old password is incorrect'],
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      return res.json({
        code: 200,
        status: 'success',
        message: ['Password changed successfully'],
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
      });
    }
  },
  async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, phone_number, subscribe_until, role } =
        req.body;

      const rules = {
        name: 'required|string',
        email: 'required|email',
        password: 'required|string',
        phone_number: 'required|string',
        subscribe_until: 'date',
        role: 'string|in:admin,user',
      };

      const validation = new Validator(
        { name, email, password, phone_number, subscribe_until, role },
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
          message: ['Email already exists'],
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone_number,
        subscribe_until: subscribe_until || null,
        role: role || undefined,
      });

      const { password: _, ...userData } = user.get({ plain: true });
      return res.json({ code: 201, status: 'success', data: userData });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: ['Server error'],
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
          message: ['Invalid credentials'],
        });

      const match = await bcrypt.compare(password, userInstance.password);

      if (!match)
        return res.json({
          code: 400,
          status: 'error',
          message: ['Invalid credentials'],
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
        message: ['Login successful'],
        token: token,
        data: userData,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: ['Internal server error'],
      });
    }
  },
};
