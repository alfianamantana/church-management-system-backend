import { Request, Response } from 'express';
import { Congregation, User, Church } from '../model';
import { Op, fn } from 'sequelize';
import sequelize from '../../config/db.config';
import { getValidationRules, validateField } from '../helpers';

export const CongregationController = {
  async get(req: Request, res: Response) {
    const { church } = req;
    try {
      const {
        page = 1,
        limit = 10,
        id,
        q,
        family_id,
        gender,
        birth_date_start,
        birth_date_end,
        dad,
        mom,
        children,
        couple,
      } = req.query;

      const exclude_id = req.query['exclude_id[]'];

      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const excludeIds = exclude_id
        ? Array.isArray(exclude_id)
          ? exclude_id
          : [exclude_id]
        : [];

      console.log(excludeIds, 'excludeIds');

      const whereClause: any = {
        church_id: church?.id,
        ...(gender && { gender: String(gender) }),
        ...(excludeIds.length > 0 && { id: { [Op.notIn]: excludeIds } }),
        ...(q && { name: { [Op.iLike]: `%${q}%` } }),
        ...(id && { id }),
        ...(family_id && { family_id }),
        ...(birth_date_start &&
          birth_date_end && {
            birth_date: {
              [Op.between]: [
                new Date(String(birth_date_start)),
                new Date(String(birth_date_end)),
              ],
            },
          }),
      };

      const includeClause: any[] = [
        ...(couple === 'true' ? [{ model: Congregation, as: 'couple' }] : []),
        ...(dad === 'true' ? [{ model: Congregation, as: 'dad' }] : []),
        ...(mom === 'true' ? [{ model: Congregation, as: 'mom' }] : []),
        ...(children === 'true'
          ? [
              { model: Congregation, as: 'momChildren', required: false },
              { model: Congregation, as: 'dadChildren', required: false },
            ]
          : []),
      ].flat();

      const count = await Congregation.count({ where: whereClause });
      let rows = await Congregation.findAll({
        offset,
        limit: limitNum,
        where: whereClause,
        include: includeClause,
        attributes: [
          ...Object.keys(Congregation.rawAttributes),
          [
            fn(
              'EXTRACT',
              sequelize.literal('YEAR FROM AGE("Congregation"."birth_date")'),
            ),
            'age',
          ],
        ],
        order: [['id', 'ASC']],
      });

      rows = rows.map((row) => {
        const plain = row.toJSON();
        plain.children = [
          ...(plain.momChildren || []),
          ...(plain.dadChildren || []),
        ];
        return plain;
      });

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Data Congregation berhasil diambil'],
          en: ['Congregation data retrieved successfully'],
        },
        data: rows,
        pagination: {
          total: count,
          page: pageNum,
        },
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
      });
    }
  },
  async update(req: Request, res: Response) {
    try {
      const { church } = req;
      const { id } = req.query;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate id field
      const errors = validateField(id, validationRules.id);
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

      const {
        name,
        birth_date,
        born_place,
        baptism_date,
        is_married,
        mom_id,
        dad_id,
        phone_number,
        family_id,
        gender,
        couple_id,
      } = req.body;

      const jemaat = await Congregation.findOne({
        where: { id, church_id: church?.id },
      });

      if (!jemaat) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Congregation tidak ditemukan'],
            en: ['Congregation not found'],
          },
        });
      }

      if (typeof name !== 'undefined') jemaat.name = name;
      if (typeof birth_date !== 'undefined') jemaat.birth_date = birth_date;
      if (typeof born_place !== 'undefined') jemaat.born_place = born_place;
      if (typeof baptism_date !== 'undefined')
        jemaat.baptism_date = baptism_date;
      if (typeof is_married !== 'undefined') jemaat.is_married = is_married;
      if (typeof mom_id !== 'undefined' && mom_id !== '')
        jemaat.mom_id = mom_id;
      if (typeof dad_id !== 'undefined' && dad_id !== '')
        jemaat.dad_id = dad_id;
      if (typeof phone_number !== 'undefined')
        jemaat.phone_number = phone_number;
      if (typeof family_id !== 'undefined' && family_id !== '')
        jemaat.family_id = family_id;
      if (typeof gender !== 'undefined') jemaat.gender = gender;
      if (typeof couple_id !== 'undefined' && couple_id !== '')
        jemaat.couple_id = couple_id;

      await jemaat.save();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Congregation berhasil diperbarui'],
          en: ['Congregation updated successfully'],
        },
        data: jemaat,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
      });
    }
  },
  async create(req: Request, res: Response) {
    let transaction;
    const { church, user } = req;
    try {
      const {
        name,
        birth_date,
        born_place,
        baptism_date,
        is_married,
        mom_id,
        dad_id,
        phone_number,
        gender,
        couple_id,
      } = req.body;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate each field
      const fields = {
        name: { value: name, rules: validationRules.name },
        birth_date: { value: birth_date, rules: validationRules.birth_date },
        born_place: { value: born_place, rules: validationRules.born_place },
        gender: { value: gender, rules: validationRules.gender },
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

      transaction = await sequelize.transaction();
      await Congregation.create(
        {
          name,
          birth_date,
          born_place,
          baptism_date: baptism_date || null,
          is_married,
          mom_id: mom_id || null,
          dad_id: dad_id || null,
          phone_number: phone_number || null,
          gender: gender || 'male',
          couple_id: couple_id || null,
          church_id: church?.id, // Add church_id
        },
        { transaction },
      );

      // Increment total_jemaat_created for the user
      await User.increment('total_jemaat_created', {
        where: { id: user?.id },
        transaction,
      });

      await transaction.commit();

      return res.json({
        code: 201,
        status: 'success',
        message: {
          id: ['Congregation berhasil dibuat'],
          en: ['Congregation created successfully'],
        },
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
      });
    }
  },
  async delete(req: Request, res: Response) {
    let transaction;
    try {
      const { user } = req;
      const { id } = req.query;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate id field
      const errors = validateField(id, validationRules.id);
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

      // Get church for the user
      const church = await Church.findOne({ where: { user_id: user?.id } });
      if (!church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }

      const jemaat = await Congregation.findOne({
        where: { id, church_id: church.id },
      });

      if (!jemaat) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Congregation tidak ditemukan'],
            en: ['Congregation not found'],
          },
        });
      }
      transaction = await sequelize.transaction();
      await jemaat.destroy({ transaction });

      await User.decrement('total_jemaat_created', {
        where: { id: user?.id },
        transaction,
      });
      transaction.commit();

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Congregation berhasil dihapus'],
          en: ['Congregation deleted successfully'],
        },
      });
    } catch (err) {
      if (transaction) await transaction.rollback();
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
      });
    }
  },
  async getChildren(req: Request, res: Response) {
    try {
      const { id } = req.query;

      // Simplified validation
      const validationRules = getValidationRules();
      const errorsId: string[] = [];
      const errorsEn: string[] = [];

      // Validate id field
      const errors = validateField(id, validationRules.id);
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

      // Get church for the user
      const church = await Church.findOne({ where: { user_id: req.user?.id } });
      if (!church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }

      // Check if parent jemaat exists and belongs to current church
      const parentCongregation = await Congregation.findOne({
        where: { id: id, church_id: church.id },
      });

      if (!parentCongregation) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Orang tua jemaat tidak ditemukan'],
            en: ['Parent Congregation not found'],
          },
        });
      }

      // Get all children (mom_id or dad_id equals to parent id)
      const children = await Congregation.findAll({
        where: {
          [Op.or]: [{ mom_id: id }, { dad_id: id }],
          user_id: req.user?.id, // Ensure children belong to same user
        },
        attributes: [
          ...Object.keys(Congregation.rawAttributes),
          [
            fn(
              'EXTRACT',
              sequelize.literal('YEAR FROM AGE("Congregation"."birth_date")'),
            ),
            'age',
          ],
        ],
        order: [['birth_date', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        message: {
          id: ['Data Anak berhasil diambil'],
          en: ['Children retrieved successfully'],
        },
        data: children,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },
  async getBirthdayByMonth(req: Request, res: Response) {
    try {
      const { date } = req.query;
      if (!date) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Tanggal diperlukan'],
            en: ['Date is required'],
          },
        });
      }

      const parsedDate = new Date(String(date));
      if (isNaN(parsedDate.getTime())) {
        return res.json({
          code: 400,
          status: 'error',
          message: {
            id: ['Format tanggal tidak valid'],
            en: ['Invalid date format'],
          },
        });
      }

      const month = parsedDate.getMonth() + 1; // getMonth() returns 0-11, so add 1

      // Get church for the user
      const church = await Church.findOne({ where: { user_id: req.user?.id } });
      if (!church) {
        return res.json({
          code: 404,
          status: 'error',
          message: {
            id: ['Gereja tidak ditemukan'],
            en: ['Church not found'],
          },
        });
      }

      const jemaats = await Congregation.findAll({
        where: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn(
                'EXTRACT',
                sequelize.literal('MONTH FROM "Congregation"."birth_date"'),
              ),
              month,
            ),
            { church_id: church.id },
          ],
        },
        attributes: [
          ...Object.keys(Congregation.rawAttributes),
          [
            fn(
              'EXTRACT',
              sequelize.literal('YEAR FROM AGE("Congregation"."birth_date")'),
            ),
            'age',
          ],
        ],
        order: [['birth_date', 'ASC']],
      });

      return res.json({
        code: 200,
        status: 'success',
        data: jemaats,
      });
    } catch (err) {
      return res.json({
        code: 500,
        status: 'error',
        message: {
          id: ['Terjadi kesalahan pada server'],
          en: ['Internal server error'],
        },
        error: err,
      });
    }
  },
};
