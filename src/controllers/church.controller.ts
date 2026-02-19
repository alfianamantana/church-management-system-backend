import { Request, Response } from 'express';
import { Church, User, UserChurch, SubscribeType } from '../model';
import { validateField, getValidationRules } from '../helpers';

export const ChurchController = {
  async get(req: Request, res: Response) {
    const { user } = req as Express.Request;
    try {
      const churches = await Church.findAll({
        include: [
          {
            model: User,
            where: { id: user?.id },
            through: { attributes: [] },
          },
        ],
      });
      return res.json({
        code: 200,
        status: 'success',
        data: churches,
        message: {
          id: ['Data gereja berhasil diambil'],
          en: ['Church data retrieved successfully'],
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
  async create(req: Request, res: Response) {
    const { user } = req as Express.Request;
    const transaction = await Church.sequelize!.transaction();
    try {
      // Lock and fetch user data to prevent race conditions
      const dbUser = await User.findOne({
        where: { id: user?.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!dbUser) {
        await transaction.rollback();
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['User tidak ditemukan'],
            en: ['User not found'],
          },
        });
      }

      const { name, email, city, phone_number } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate each field
      const fields = {
        name: { value: name, rules: validationRules.name },
        email: { value: email, rules: validationRules.email },
        city: { value: city, rules: validationRules.city },
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

      // If there are validation errors, return them
      if (errorsId.length > 0 || errorsEn.length > 0) {
        await transaction.rollback();
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

      const createdChurch = await Church.create(
        {
          ...req.body,
        },
        { transaction },
      );

      // Create UserChurch relationship
      await UserChurch.create(
        {
          user_id: dbUser.id,
          church_id: createdChurch.id,
        },
        { transaction },
      );

      const newuser = await User.findOne({
        where: { id: dbUser.id },
        include: [Church],
        transaction,
      });

      await transaction.commit();

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Gereja berhasil dibuat'],
          en: ['Church created successfully'],
        },
        data: newuser,
      });
    } catch (err) {
      console.log(err, '?AsdasD?');

      await transaction.rollback();
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
  async update(req: Request, res: Response) {
    const transaction = await Church.sequelize!.transaction();
    try {
      const { church } = req as Express.Request;
      const { name, email, city, phone_number, user_id } = req.body;

      // Simplified validation for optional fields
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate optional fields only if provided
      if (name !== undefined) {
        const errors = validateField(name, validationRules.name);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (email !== undefined) {
        const errors = validateField(email, validationRules.email);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (city !== undefined) {
        const errors = validateField(city, validationRules.city);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (phone_number !== undefined) {
        const errors = validateField(
          phone_number,
          validationRules.phone_number,
        );
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      if (user_id !== undefined) {
        const errors = validateField(user_id, validationRules.user_id);
        if (errors.id) errorsId.push(errors.id);
        if (errors.en) errorsEn.push(errors.en);
      }

      // If there are validation errors, return them
      if (errorsId.length > 0 || errorsEn.length > 0) {
        await transaction.rollback();
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: errorsId,
            en: errorsEn,
          },
        });
      }

      await Church.update(req.body, {
        where: { id: church?.id },
        transaction,
      });

      // If user_id is being updated, update the UserChurch record
      if (user_id !== undefined) {
        // Find existing UserChurch record
        const existingUserChurch = await UserChurch.findOne({
          where: { church_id: church?.id },
          transaction,
        });

        if (existingUserChurch) {
          // Update existing record
          await existingUserChurch.update({ user_id }, { transaction });
        } else {
          // Create new record if it doesn't exist
          await UserChurch.create(
            {
              user_id,
              church_id: church?.id,
            },
            { transaction },
          );
        }
      }

      await transaction.commit();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Gereja berhasil diperbarui'],
          en: ['Church updated successfully'],
        },
      });
    } catch (err) {
      await transaction.rollback();
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
